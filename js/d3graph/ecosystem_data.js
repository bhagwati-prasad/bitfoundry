// Every node can optionally have a 'subGraph' property containing { nodes: [], links: [] }
const ecosystemData = {
    id: "a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6",
    label: "Ecosystem",
    groups: {
        "3f4e5d6c-7b8a-49f0-ae1d-2c3b4a5e6d7f": { 
            id: "3f4e5d6c-7b8a-49f0-ae1d-2c3b4a5e6d7f",
            title: "Default", 
            color: "#000000", 
            radius: 15,
            description: "Default group for uncategorized entities"
        },
        "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d": { 
            id: "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
            title: "Central Unit", 
            color: "#2563eb", 
            radius: 40,
            description: "Core switching and routing infrastructure"
        },
        "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e": { 
            id: "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e",
            title: "Operating Unit", 
            color: "#059669", 
            radius: 30,
            description: "Customer and biller operating units"
        },
        "3c4d5e6f-7a8b-4c9d-0e1f-2a3b4c5d6e7f": { 
            id: "3c4d5e6f-7a8b-4c9d-0e1f-2a3b4c5d6e7f",
            title: "End User", 
            color: "#d97706", 
            radius: 25,
            description: "External endpoints and user interfaces"
        },
        "4d5e6f7a-8b9c-4d0e-1f2a-3b4c5d6e7f8a": { 
            id: "4d5e6f7a-8b9c-4d0e-1f2a-3b4c5d6e7f8a",
            title: "Support System", 
            color: "#7c3aed", 
            radius: 25,
            description: "Dispute management and support services"
        },
        "5e6f7a8b-9c0d-4e1f-2a3b-4c5d6e7f8a9b": { 
            id: "5e6f7a8b-9c0d-4e1f-2a3b-4c5d6e7f8a9b",
            title: "Internal Component", 
            color: "#475569", 
            radius: 25,
            description: "Internal processing and business logic"
        }
    },
    nodes: [
        {
            id: "f7e8d9c0-b1a2-4c3d-9e8f-7a6b5c4d3e2f", label: "BBPCU", group: "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d", desc: "<strong>Central Unit (NBBL)</strong>. The Hub.<br>Click to drill down into Switch Architecture.",
            subGraph: {
                id: "e4d5c6b7-a8f9-4e0d-b1c2-a3f4e5d6c7b8",
                label: "BBPCU Internal",
                nodes: [
                    { id: "c9d8e7f6-a5b4-4c3d-8e9f-a0b1c2d3e4f5", label: "Core Switch", group: "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d", desc: "Transaction Switching Engine." },
                    { id: "b8a7c6d5-e4f3-4b2a-9c8d-7e6f5a4b3c2d", label: "Router", group: "5e6f7a8b-9c0d-4e1f-2a3b-4c5d6e7f8a9b", desc: "Routes based on Biller ID." },
                    { id: "a7b6c5d4-e3f2-4a1b-8c9d-0e1f2a3b4c5d", label: "Risk Engine", group: "5e6f7a8b-9c0d-4e1f-2a3b-4c5d6e7f8a9b", desc: "Fraud checks & velocity limits." },
                    {
                        id: "d6e5f4a3-b2c1-4d0e-9f8a-7b6c5d4e3f2a", label: "Clearing Sys", group: "5e6f7a8b-9c0d-4e1f-2a3b-4c5d6e7f8a9b", desc: "Net Settlement Calculation.<br>Click for Deep Dive.",
                        // Level 3 Drill Down
                        subGraph: {
                            id: "e3f2a1b0-c9d8-4e7f-a6b5-c4d3e2f1a0b9",
                            label: "Clearing Logic",
                            nodes: [
                                { id: "f2a1b0c9-d8e7-4f6a-b5c4-d3e2f1a0b9c8", label: "Net Calc", group: "5e6f7a8b-9c0d-4e1f-2a3b-4c5d6e7f8a9b", desc: "Calculates Pay-in/Pay-out." },
                                { id: "a0b9c8d7-e6f5-4a4b-c3d2-e1f0a9b8c7d6", label: "Collateral", group: "5e6f7a8b-9c0d-4e1f-2a3b-4c5d6e7f8a9b", desc: "Checks bank guarantees." },
                                { id: "b9c8d7e6-f5a4-4b3c-d2e1-f0a9b8c7d6e5", label: "File Gen", group: "3c4d5e6f-7a8b-4c9d-0e1f-2a3b4c5d6e7f", desc: "Generates settlement files for RTGS (Real Time Gross Settlement)." }
                            ],
                            links: [
                                { source: "f2a1b0c9-d8e7-4f6a-b5c4-d3e2f1a0b9c8", target: "a0b9c8d7-e6f5-4a4b-c3d2-e1f0a9b8c7d6", type: "internal", label: "Check" },
                                { source: "f2a1b0c9-d8e7-4f6a-b5c4-d3e2f1a0b9c8", target: "b9c8d7e6-f5a4-4b3c-d2e1-f0a9b8c7d6e5", type: "internal", label: "Export" }
                            ]
                        }
                    }
                ],
                links: [
                    { source: "c9d8e7f6-a5b4-4c3d-8e9f-a0b1c2d3e4f5", target: "b8a7c6d5-e4f3-4b2a-9c8d-7e6f5a4b3c2d", type: "internal", label: "Lookup" },
                    { source: "c9d8e7f6-a5b4-4c3d-8e9f-a0b1c2d3e4f5", target: "a7b6c5d4-e3f2-4a1b-8c9d-0e1f2a3b4c5d", type: "internal", label: "Validate" },
                    { source: "c9d8e7f6-a5b4-4c3d-8e9f-a0b1c2d3e4f5", target: "d6e5f4a3-b2c1-4d0e-9f8a-7b6c5d4e3f2a", type: "internal", label: "Log" }
                ]
            }
        },
        {
            id: "c5d4e3f2-a1b0-4c9d-8e7f-a6b5c4d3e2f1", label: "COU", group: "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e", desc: "<strong>Customer Operating Unit</strong>. Bank/App.<br>Click for Internal Architecture.",
            subGraph: {
                id: "d4e3f2a1-b0c9-4d8e-7f6a-5b4c3d2e1f0a",
                label: "COU Internal",
                nodes: [
                    { id: "e2f1a0b9-c8d7-4e6f-5a4b-3c2d1e0f9a8b", label: "App UI", group: "3c4d5e6f-7a8b-4c9d-0e1f-2a3b4c5d6e7f", desc: "Mobile/Web Interface." },
                    { id: "f1a0b9c8-d7e6-4f5a-4b3c-2d1e0f9a8b7c", label: "API Gateway", group: "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e", desc: "Security & Rate Limiting." },
                    { id: "a9b8c7d6-e5f4-4a3b-2c1d-0e9f8a7b6c5d", label: "Core Banking", group: "5e6f7a8b-9c0d-4e1f-2a3b-4c5d6e7f8a9b", desc: "Ledger system." }
                ],
                links: [
                    { source: "e2f1a0b9-c8d7-4e6f-5a4b-3c2d1e0f9a8b", target: "f1a0b9c8-d7e6-4f5a-4b3c-2d1e0f9a8b7c", type: "flow", label: "HTTPS" },
                    { source: "f1a0b9c8-d7e6-4f5a-4b3c-2d1e0f9a8b7c", target: "a9b8c7d6-e5f4-4a3b-2c1d-0e9f8a7b6c5d", type: "internal", label: "Debit" }
                ]
            }
        },
        {
            id: "b7c6d5e4-f3a2-4b1c-0d9e-8f7a6b5c4d3e", label: "BOU", group: "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e", desc: "<strong>Biller Operating Unit</strong>. Connects Billers.<br>Click for Internal Architecture.",
            subGraph: {
                id: "c6d5e4f3-a2b1-4c0d-9e8f-7a6b5c4d3e2f",
                label: "BOU Internal",
                nodes: [
                    { id: "d5e4f3a2-b1c0-4d9e-8f7a-6b5c4d3e2f1a", label: "Biller Adapter", group: "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e", desc: "Format translation." },
                    { id: "e4f3a2b1-c0d9-4e8f-7a6b-5c4d3e2f1a0b", label: "Recon Engine", group: "5e6f7a8b-9c0d-4e1f-2a3b-4c5d6e7f8a9b", desc: "Matches transactions." },
                    { id: "f3a2b1c0-d9e8-4f7a-6b5c-4d3e2f1a0b9c", label: "Utility API", group: "3c4d5e6f-7a8b-4c9d-0e1f-2a3b4c5d6e7f", desc: "External Biller System." }
                ],
                links: [
                    { source: "d5e4f3a2-b1c0-4d9e-8f7a-6b5c4d3e2f1a", target: "f3a2b1c0-d9e8-4f7a-6b5c-4d3e2f1a0b9c", type: "flow", label: "Fetch" },
                    { source: "d5e4f3a2-b1c0-4d9e-8f7a-6b5c4d3e2f1a", target: "e4f3a2b1-c0d9-4e8f-7a6b-5c4d3e2f1a0b", type: "internal", label: "Log" }
                ]
            }
        },
        { id: "a3b2c1d0-e9f8-4a7b-6c5d-4e3f2a1b0c9d", label: "DMS", group: "4d5e6f7a-8b9c-4d0e-1f2a-3b4c5d6e7f8a", desc: "Dispute Management System." },
        { id: "b2c1d0e9-f8a7-4b6c-5d4e-3f2a1b0c9d8e", label: "SGF", group: "4d5e6f7a-8b9c-4d0e-1f2a-3b4c5d6e7f8a", desc: "Settlement Guarantee Fund." },
        { id: "c1d0e9f8-a7b6-4c5d-4e3f-2a1b0c9d8e7f", label: "Agent", group: "3c4d5e6f-7a8b-4c9d-0e1f-2a3b4c5d6e7f", desc: "Physical or Digital touchpoint." },
        { id: "d0e9f8a7-b6c5-4d4e-3f2a-1b0c9d8e7f6a", label: "Customer", group: "3c4d5e6f-7a8b-4c9d-0e1f-2a3b4c5d6e7f", desc: "End User." },
        { id: "e9f8a7b6-c5d4-4e3f-2a1b-0c9d8e7f6a5b", label: "Biller", group: "3c4d5e6f-7a8b-4c9d-0e1f-2a3b4c5d6e7f", desc: "The Utility Company." }
    ],
    links: [
        { source: "d0e9f8a7-b6c5-4d4e-3f2a-1b0c9d8e7f6a", target: "c1d0e9f8-a7b6-4c5d-4e3f-2a1b0c9d8e7f", type: "flow", label: "1. Init" },
        { source: "c1d0e9f8-a7b6-4c5d-4e3f-2a1b0c9d8e7f", target: "c5d4e3f2-a1b0-4c9d-8e7f-a6b5c4d3e2f1", type: "flow", label: "2. Req" },
        { source: "c5d4e3f2-a1b0-4c9d-8e7f-a6b5c4d3e2f1", target: "f7e8d9c0-b1a2-4c3d-9e8f-7a6b5c4d3e2f", type: "flow", label: "3. Route" },
        { source: "f7e8d9c0-b1a2-4c3d-9e8f-7a6b5c4d3e2f", target: "b7c6d5e4-f3a2-4b1c-0d9e-8f7a6b5c4d3e", type: "flow", label: "4. Switch" },
        { source: "b7c6d5e4-f3a2-4b1c-0d9e-8f7a6b5c4d3e", target: "e9f8a7b6-c5d4-4e3f-2a1b-0c9d8e7f6a5b", type: "flow", label: "5. Fetch" },
        { source: "e9f8a7b6-c5d4-4e3f-2a1b-0c9d8e7f6a5b", target: "b7c6d5e4-f3a2-4b1c-0d9e-8f7a6b5c4d3e", type: "flow", label: "6. Data" },
        { source: "b7c6d5e4-f3a2-4b1c-0d9e-8f7a6b5c4d3e", target: "f7e8d9c0-b1a2-4c3d-9e8f-7a6b5c4d3e2f", type: "flow", label: "7. Resp" },
        { source: "f7e8d9c0-b1a2-4c3d-9e8f-7a6b5c4d3e2f", target: "c5d4e3f2-a1b0-4c9d-8e7f-a6b5c4d3e2f1", type: "flow", label: "8. Resp" },
        { source: "c5d4e3f2-a1b0-4c9d-8e7f-a6b5c4d3e2f1", target: "c1d0e9f8-a7b6-4c5d-4e3f-2a1b0c9d8e7f", type: "flow", label: "9. Show" },
        { source: "f7e8d9c0-b1a2-4c3d-9e8f-7a6b5c4d3e2f", target: "a3b2c1d0-e9f8-4a7b-6c5d-4e3f2a1b0c9d", type: "admin", label: "Disputes" },
        { source: "f7e8d9c0-b1a2-4c3d-9e8f-7a6b5c4d3e2f", target: "b2c1d0e9-f8a7-4b6c-5d4e-3f2a1b0c9d8e", type: "admin", label: "Risk" }
    ]
};