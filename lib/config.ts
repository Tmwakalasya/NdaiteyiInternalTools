// Site-wide settings — change the name here and it updates everywhere.
export const site = {
  name: "ENM Mining Consortium",
  shortName: "ENM",
  tagline: "Member portal",
};

// Schedule 1 — Consortium Members Register: the due-diligence documents each
// member provides. These become the upload checklist on a member's profile.
export const requiredMemberDocuments: {
  key: string;
  label: string;
  hint?: string;
}[] = [
  {
    key: "identity",
    label: "Certified passport or national ID",
    hint: "Certified copy of a passport or national ID.",
  },
  {
    key: "cert_incorporation",
    label: "Certificate of Incorporation",
    hint: "For companies.",
  },
  {
    key: "proof_of_authority",
    label: "Proof of authority",
    hint: "Board Resolution or Power of Attorney, where applicable.",
  },
  {
    key: "bank_confirmation",
    label: "Bank confirmation letter",
    hint: "Where commissions or payments may be made.",
  },
  {
    key: "specimen_signature",
    label: "Specimen signature",
  },
  {
    key: "company_profile",
    label: "Company profile / capability statement",
  },
];

// The SEZ Africa transaction engagement protocol. Every new project starts
// with these four phases as its checklist. Each phase is a stage you can mark
// complete; its bullet points become tick-off items. Edit these to change the
// template used for future projects (existing projects keep their own copy).
export const defaultTransactionStages: {
  name: string;
  description: string;
  items: string[];
}[] = [
  {
    name: "Phase 1 — Party Identification",
    description:
      "Before any commercial discussions or requests for buyer documentation, each participant introduces themselves.",
    items: [
      "Full name",
      "Position / designation",
      "Company represented",
      "Country of registration",
      "Role in the transaction (Principal Seller, Mandate, Broker, Facilitator, Logistics, etc.)",
      "Relationship to the commodity owner or supplier",
    ],
  },
  {
    name: "Phase 2 — Seller Due Diligence",
    description:
      "Once the parties have been identified, the seller provides verification documents.",
    items: [
      "Full legal name of the Seller",
      "Company registration documents",
      "Company profile",
      "Proof of authority to sell (Exclusive Mandate, Board Resolution or Corporate Authorization)",
      "Commodity specifications",
      "Available quantity and monthly supply capacity",
      "Country of origin",
      "Loading point",
      "Pricing basis and preferred Incoterms",
      "Standard sales procedure",
    ],
  },
  {
    name: "Phase 3 — Confidentiality & Cooperation Framework",
    description:
      "Once the opportunity is verified and both parties agree to proceed, execute the protective agreements.",
    items: [
      "Mutual Non-Disclosure Agreement (NDA)",
      "Non-Circumvention and Non-Disclosure Agreement (NCNDA)",
      "Fee Protection Agreement (where intermediaries and commissions apply)",
    ],
  },
  {
    name: "Phase 4 — Commercial Documentation",
    description:
      "Following successful completion of the earlier phases, the parties exchange commercial documentation.",
    items: [
      "Soft Corporate Offer (SCO) or Full Corporate Offer (FCO)",
      "Letter of Intent (LOI) or Irrevocable Corporate Purchase Order (ICPO)",
      "Sales and Purchase Agreement (SPA)",
    ],
  },
];
