// Report Generation Service for SETU Platform
// Creates dual summaries: Citizen-Facing Intake Summary & HEI/CSR Technical Challenge Briefing

export function generateDualReports({
  conversationState = {},
  mlResult = {},
  routingResult = {}
}) {
  const known = conversationState.knownInformation || {};
  const themes = conversationState.detectedThemes || [];
  const themeLabels = themes.map(t => typeof t === 'string' ? t : (t.label || t.name));

  const domain = known.domain || mlResult.primaryIntent || 'Water Resources';
  const district = known.district || 'Ranchi';
  const beneficiaries = known.beneficiaries || 5000;
  const urgency = routingResult.urgency || mlResult.urgencyLevel || 'GREEN';
  const assignedHEI = routingResult.assignedHEI || 'Birla Institute of Technology (BIT), Mesra';
  const partnerIndustry = routingResult.partnerIndustry || 'Tata Steel CSR & Sustainability Hub';

  // 1. Citizen / PRI Submission Receipt
  const citizenSummary = `Your societal challenge in ${district} regarding ${domain.replace('_', ' ')} has been recorded on the SETU portal. It has been routed to ${assignedHEI} for academic R&D validation and matched with ${partnerIndustry} for potential CSR funding. Estimated community impact: ~${beneficiaries.toLocaleString()} beneficiaries.`;

  // 2. Technical Challenge Briefing for Researchers & CSR
  const technicalBrief = [
    `CHALLENGE DOMAIN: ${domain.replace('_', ' ').toUpperCase()}`,
    `LOCATION: District: ${district}, Jharkhand`,
    `COMMUNITY IMPACT: Approximately ${beneficiaries.toLocaleString()} residents affected`,
    `DETECTED FOCUS AREAS: ${themeLabels.join(', ') || 'Community Infrastructure, Sustainable Innovation'}`,
    `TRIAGE URGENCY: ${urgency}`,
    `ASSIGNED R&D INSTITUTION: ${assignedHEI}`,
    `CSR / INDUSTRY SPONSOR: ${partnerIndustry}`,
    `PORTAL REFERENCE: SETU-JH-${Date.now().toString().slice(-6)}`
  ].join('\n');

  return {
    citizenSummary,
    technicalBrief,
    // Backward-compatible properties
    studentSummary: citizenSummary,
    counsellorClinicalSummary: technicalBrief
  };
}
