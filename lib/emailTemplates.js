// Pre-built email templates for different outreach scenarios
// Sellers can pick one and customize it instead of writing from scratch

export const EMAIL_TEMPLATES = [
  {
    id: 'introduction',
    name: '👋 Introduction',
    description: 'First-time outreach to introduce your brand',
    subject: (seller) => `Partnership Opportunity — ${seller?.businessName || 'Our Brand'}`,
    body: (seller) => `Dear [Buyer Name],

I hope this message finds you well. My name is ${seller?.name || '[Your Name]'}, and I'm the founder of ${seller?.businessName || '[Business Name]'}.

We specialize in ${seller?.productCategory || '[Product Category]'} and have been growing our wholesale business across the United States.

${seller?.productDescription || '[Product Description]'}

I came across your store and believe our products would be a great fit for your customers. I'd love to explore a potential partnership.

Would you be open to a quick call this week to discuss?

Best regards,
${seller?.name || '[Your Name]'}
${seller?.businessName || '[Business Name]'}
${seller?.email || '[Your Email]'}`,
  },
  {
    id: 'discount',
    name: '💰 Exclusive Discount',
    description: 'Offer a first-order discount to attract new buyers',
    subject: (seller) => `Exclusive 15% Off First Order — ${seller?.businessName || 'Our Brand'}`,
    body: (seller) => `Dear [Buyer Name],

I'm reaching out from ${seller?.businessName || '[Business Name]'} with an exclusive offer for select retail partners.

We're offering 15% OFF your first wholesale order on our ${seller?.productCategory || '[Product Category]'} collection.

${seller?.productDescription || '[Product Description]'}

Why partner with us?
• Premium quality at competitive wholesale prices
• Fast shipping across the US
• Flexible minimum order quantities
• Dedicated account support

This offer is valid for the next 30 days. I'd love to send you our full catalog and pricing.

Looking forward to hearing from you!

Best regards,
${seller?.name || '[Your Name]'}
${seller?.businessName || '[Business Name]'}
${seller?.email || '[Your Email]'}`,
  },
  {
    id: 'followup',
    name: '🔄 Follow-up',
    description: 'Follow up on a previous outreach email',
    subject: (seller) => `Following Up — ${seller?.businessName || 'Our Brand'}`,
    body: (seller) => `Dear [Buyer Name],

I hope you're doing well. I reached out last week about a potential partnership between ${seller?.businessName || '[Business Name]'} and your store.

I understand you're busy, so I wanted to follow up briefly. We offer:

${seller?.productDescription || '[Product Description]'}

Our ${seller?.productCategory || '[Product Category]'} line has been very popular with retailers across the US, and I think your customers would love it too.

Would you have 10 minutes this week for a quick call? I'd be happy to send samples as well.

Thank you for your time!

Best regards,
${seller?.name || '[Your Name]'}
${seller?.businessName || '[Business Name]'}
${seller?.email || '[Your Email]'}`,
  },
  {
    id: 'partnership',
    name: '🤝 Partnership Proposal',
    description: 'Formal partnership proposal with terms',
    subject: (seller) => `Wholesale Partnership Proposal — ${seller?.businessName || 'Our Brand'}`,
    body: (seller) => `Dear [Buyer Name],

I am writing to propose a wholesale partnership between ${seller?.businessName || '[Business Name]'} and your esteemed business.

About Us:
${seller?.businessName || '[Business Name]'} is a growing ${seller?.productCategory || '[Product Category]'} brand based in the United States. ${seller?.productDescription || '[Product Description]'}

Partnership Benefits:
• Competitive wholesale pricing (40-60% below retail)
• No minimum order for the first purchase
• Free shipping on orders above $500
• 30-day NET payment terms available
• Marketing support with product images and descriptions
• Dedicated account manager

We currently supply to over 50 retail partners and would love to add your store to our network.

I'd be happy to schedule a call or send you our complete catalog with wholesale pricing. Please let me know what works best for you.

Warm regards,
${seller?.name || '[Your Name]'}
${seller?.businessName || '[Business Name]'}
${seller?.email || '[Your Email]'}`,
  },
  {
    id: 'custom',
    name: '✏️ Custom',
    description: 'Write your own email from scratch',
    subject: (seller) => `Partnership Opportunity — ${seller?.businessName || 'Our Brand'}`,
    body: (seller) => `Dear [Buyer Name],

Write your custom email here...

Best regards,
${seller?.name || '[Your Name]'}
${seller?.email || '[Your Email]'}`,
  },
];
