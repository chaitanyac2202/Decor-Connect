export const EMAIL_TEMPLATES = [
  {
    id: 'company_mandated',
    name: '🏢 Official Company Template (Mandatory)',
    description: 'The mandatory template provided by Om Enterprises.',
    subject: (seller) => `Partnership Opportunity — Om Enterprises`,
    body: (seller) => {
      const driveLink = 'https://drive.google.com/file/d/1jrvIPWcaIlTsCKEwUnKr4T2PKAVcl2Eb/view?usp=sharing';
      
      return `Dear [Buyer Name],

I hope you’re doing well.

I’m reaching out to introduce our range of products. We specialize in delivering high-quality solutions designed to meet your business needs efficiently and cost-effectively.

You can view our product presentation and catalog here: 
${driveLink}

I would be happy to discuss how we can support your requirements.

Looking forward to your feedback.

Best regards,
Business Development Manager
Om Enterprises - Moradabad, Uttar Pradesh, India
Manager - Umesh`;
    }
  }
];
