"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { relativeTime } from "@/lib/activity";
import type { Notification } from "@/lib/types";

const PANEL_WIDTH = 352;

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [panelStyle, setPanelStyle] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  function updatePanelPosition() {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const maxLeft = window.innerWidth - PANEL_WIDTH - 16;
    const left = Math.max(16, Math.min(rect.left, maxLeft));
    setPanelStyle({ top: rect.bottom + 8, left });
  }

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = (await res.json()) as {
          notifications: Notification[];
          unread: number;
        };
        setNotifications(data.notifications);
        setUnread(data.unread);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!open) return;

    updatePanelPosition();

    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        panelRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    function onResize() {
      updatePanelPosition();
    }

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open]);

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n
      )
    );
    setUnread((c) => Math.max(0, c - 1));
  }

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        read_at: n.read_at ?? new Date().toISOString(),
      }))
    );
    setUnread(0);
  }

  const panel =
    open && mounted ? (
      <div
        ref={panelRef}
        style={{ top: panelStyle.top, left: panelStyle.left, width: PANEL_WIDTH }}
        className="fixed z-[100] overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          {unread > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="inline-flex items-center gap-1 text-xs font-medium text-muted transition hover:text-ink"
            >
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading && notifications.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted">Loading…</p>
          )}

          {!loading && notifications.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted">
              No notifications yet
            </p>
          )}

          {notifications.map((n) => (
            <div
              key={n.id}
              className={`border-b border-line px-4 py-3 last:border-b-0 ${
                n.read_at ? "opacity-60" : "bg-indigo-50/50"
              }`}
            >
              {n.href ? (
                <Link
                  href={n.href}
                  onClick={() => {
                    if (!n.read_at) markRead(n.id);
                    setOpen(false);
                  }}
                  className="block"
                >
                  <p className="text-sm font-medium leading-snug">{n.title}</p>
                  {n.body && (
                    <p className="mt-0.5 text-xs text-muted">{n.body}</p>
                  )}
                  <p className="mt-1 font-mono text-[10px] text-muted">
                    {relativeTime(n.created_at)}
                  </p>
                </Link>
              ) : (
                <div>
                  <p className="text-sm font-medium leading-snug">{n.title}</p>
                  {n.body && (
                    <p className="mt-0.5 text-xs text-muted">{n.body}</p>
                  )}
                  <p className="mt-1 font-mono text-[10px] text-muted">
                    {relativeTime(n.created_at)}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setOpen((v) => {
            const next = !v;
            if (next) {
              requestAnimationFrame(updatePanelPosition);
              load();
            }
            return next;
          });
        }}
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink transition hover:bg-panel"
        title="Notifications"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell size={18} strokeWidth={1.75} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {mounted && panel ? createPortal(panel, document.body) : null}
    </>
  );
}
