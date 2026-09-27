// Pre-built email templates for different outreach scenarios
// Sellers can pick one and customize it instead of writing from scratch

export const EMAIL_TEMPLATES = [
  {
    id: 'introduction',
    name: '👋 Introduction',
    description: 'Product introduction outreach',
    subject: (seller) => `Partnership Opportunity — Om Enterprises`,
    body: (seller) => {
      let attachmentText = '';
      if (seller?.productCategory?.toLowerCase().includes('candle holder')) {
        attachmentText = `\n\nPlease find attached our SINGING BOWL presentation for your review. (See attached Candle Holder Collection PDF).`;
      } else {
        attachmentText = `\n\nPlease find attached our SINGING BOWL presentation for your review.`;
      }
      
      return `Dear [Buyer Name],

I hope you’re doing well.

I’m reaching out to introduce our range of products.. We specialize in delivering high-quality solutions designed to meet your business needs efficiently and cost-effectively.${attachmentText}

I would be happy to discuss how we can support your requirements.

Looking forward to your feedback.

Best regards,
Business Development Manager
Om Enterprises - Moradabad, Uttar Pradesh, India
Manager - Umesh`;
    }
  }
];
