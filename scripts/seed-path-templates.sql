-- Seed data for path_templates table
-- 20 diverse career/business path templates across categories

INSERT INTO path_templates (
  title,
  category,
  description,
  skills_needed,
  values_match,
  time_to_income,
  startup_cost,
  income_potential,
  risk_level,
  first_win,
  why_template
) VALUES
-- FREELANCE PATHS
(
  'Freelance Content Writer',
  'freelance',
  'Create compelling written content for businesses, blogs, and marketing campaigns. Work with multiple clients on your schedule.',
  ARRAY['writing', 'research', 'SEO basics', 'communication', 'time management'],
  ARRAY['Freedom', 'Creativity', 'Flexibility'],
  '1-3 months',
  '$0-500',
  '$3-10K/mo',
  'low',
  'Sign up for Upwork and Fiverr, create 3 writing samples in your niche, and send 10 proposals to beginner-friendly jobs.',
  'This path aligns with your need for {value} because you can work from anywhere, choose your clients, and build a portfolio while earning. Your {skill} skills will help you stand out quickly.'
),
(
  'Freelance Web Developer',
  'freelance',
  'Build websites and web applications for clients. High demand for both frontend and full-stack developers.',
  ARRAY['HTML/CSS', 'JavaScript', 'React or similar framework', 'problem-solving', 'client communication'],
  ARRAY['Growth', 'Financial Security', 'Learning'],
  '3-6 months',
  '$0-500',
  '$5-15K/mo',
  'medium',
  'Complete a free coding bootcamp (freeCodeCamp), build 2 portfolio projects, and reach out to 5 local small businesses.',
  'With your interest in {value}, web development offers continuous learning and strong income potential. The tech skills you build become more valuable over time.'
),
(
  'Virtual Assistant for Executives',
  'freelance',
  'Provide administrative, scheduling, and organizational support to busy entrepreneurs and executives remotely.',
  ARRAY['organization', 'communication', 'calendar management', 'basic tech tools', 'discretion'],
  ARRAY['Service', 'Stability', 'Flexibility'],
  '1-3 months',
  '$0-500',
  '$3-8K/mo',
  'low',
  'Create profiles on Belay, Time Etc, and VAVA, highlighting any admin experience. Apply to 15 VA positions this week.',
  'Your {skill} abilities make you perfect for this role. You can start quickly, build steady client relationships, and work the hours that suit your lifestyle while providing {value}.'
),
(
  'Graphic Designer (Brand Identity)',
  'freelance',
  'Design logos, brand guidelines, and visual identities for businesses. Creative work with strong demand.',
  ARRAY['Adobe Creative Suite', 'design principles', 'communication', 'creativity', 'client feedback'],
  ARRAY['Creativity', 'Expression', 'Freedom'],
  '2-4 months',
  '$500-2000',
  '$4-12K/mo',
  'medium',
  'Master one design tool (Figma is free), create 5 brand identity mockups for fictional companies, post them on Behance and Dribbble.',
  'If {value} matters to you, design work lets you express yourself daily while solving real business problems. Your creative vision becomes your competitive advantage.'
),

-- BUSINESS PATHS
(
  'E-commerce Store Owner (Print-on-Demand)',
  'business',
  'Sell custom-designed products without inventory through print-on-demand services like Printful or Printify.',
  ARRAY['basic design', 'marketing', 'customer service', 'product research', 'branding'],
  ARRAY['Entrepreneurship', 'Creativity', 'Financial Security'],
  '3-6 months',
  '$500-2000',
  '$5-20K/mo',
  'medium',
  'Choose a niche, create 5 designs using Canva, set up a Shopify store with Printful integration, and launch 1 Facebook ad campaign.',
  'This path supports your {value} by giving you full ownership of a scalable business. Start small, test designs, and grow based on what sells.'
),
(
  'Digital Marketing Agency Owner',
  'business',
  'Help businesses grow through paid ads, SEO, or social media marketing. Start solo, scale with contractors.',
  ARRAY['digital marketing', 'sales', 'client management', 'analytics', 'copywriting'],
  ARRAY['Growth', 'Financial Security', 'Leadership'],
  '3-6 months',
  '$1000-3000',
  '$10-50K/mo',
  'high',
  'Pick one service (Facebook Ads or Google Ads), get certified for free, offer to run campaigns for 2 local businesses at discounted rates.',
  'For someone who values {value}, running an agency gives you unlimited growth potential and the ability to build a team. Your {skill} will be crucial for landing clients.'
),
(
  'Consulting: Strategy & Operations',
  'business',
  'Leverage your professional experience to advise businesses on strategy, operations, or process improvement.',
  ARRAY['industry expertise', 'analytical thinking', 'presentation', 'problem-solving', 'business acumen'],
  ARRAY['Impact', 'Authority', 'Financial Security'],
  '2-4 months',
  '$500-1000',
  '$8-30K/mo',
  'medium',
  'Define your niche expertise, create a 1-page service offering, and reach out to 10 businesses in your network for coffee chats.',
  'Your experience becomes your product. If {value} drives you, consulting lets you make meaningful impact while commanding premium rates for your expertise.'
),
(
  'Amazon FBA Seller',
  'business',
  'Source or create products to sell on Amazon using their fulfillment network. Product-based business with Amazon handling logistics.',
  ARRAY['product research', 'sourcing', 'basic marketing', 'inventory management', 'customer service'],
  ARRAY['Entrepreneurship', 'Financial Security', 'Growth'],
  '4-8 months',
  '$3000-8000',
  '$10-50K/mo',
  'high',
  'Research 20 products using Jungle Scout, analyze competition and margins, source 1 sample product from Alibaba, and test it yourself.',
  'This is a true business requiring investment and patience. If {value} is important to you, FBA offers serious income potential and business ownership.'
),

-- CREATOR PATHS
(
  'YouTube Channel (Niche Expert)',
  'creator',
  'Build an audience by teaching or entertaining in a specific niche. Monetize through ads, sponsorships, and products.',
  ARRAY['video editing', 'content creation', 'presentation', 'consistency', 'audience building'],
  ARRAY['Expression', 'Impact', 'Community'],
  '6-12 months',
  '$500-2000',
  '$3-30K/mo',
  'medium',
  'Pick your niche, research 10 top channels, script and record 5 videos, post one per week, and engage with every comment.',
  'If {value} resonates with you, YouTube lets you share your voice and build a loyal community. Growth takes time but compounds powerfully.'
),
(
  'Technical Course Creator',
  'creator',
  'Package your expertise into online courses and sell on platforms like Udemy, Teachable, or your own site.',
  ARRAY['subject matter expertise', 'teaching', 'video production', 'curriculum design', 'marketing'],
  ARRAY['Impact', 'Teaching', 'Passive Income'],
  '3-6 months',
  '$500-2000',
  '$5-25K/mo',
  'medium',
  'Outline your course curriculum, record a free 20-minute mini-course, share it on LinkedIn/Reddit to validate demand.',
  'For someone who values {value}, course creation lets you teach at scale and earn while you sleep. Your knowledge becomes a product.'
),
(
  'Podcast Host & Producer',
  'creator',
  'Create audio content around your niche, build an audience, and monetize through sponsorships and affiliate partnerships.',
  ARRAY['audio editing', 'interviewing', 'storytelling', 'consistency', 'marketing'],
  ARRAY['Expression', 'Community', 'Connection'],
  '4-8 months',
  '$500-1500',
  '$2-15K/mo',
  'medium',
  'Define your show concept, record 3 pilot episodes, publish on Anchor (free), and share with 50 people in your niche.',
  'Podcasting aligns with {value} by creating intimate conversations and community. Start with your voice, grow through consistency and authentic connection.'
),
(
  'Coaching Business (Career/Life)',
  'creator',
  'Guide clients through career transitions, personal development, or specific life challenges. High-touch, high-value service.',
  ARRAY['active listening', 'empathy', 'questioning', 'accountability', 'communication'],
  ARRAY['Service', 'Impact', 'Connection'],
  '2-4 months',
  '$500-1500',
  '$5-20K/mo',
  'low',
  'Get certified through a free or low-cost program (Coach Training Alliance), offer 5 free sessions to get testimonials.',
  'If {value} is core to who you are, coaching lets you directly transform lives. Your wisdom and empathy become your greatest assets.'
),

-- TECH PATHS
(
  'SaaS Product Builder',
  'tech',
  'Build and launch software-as-a-service products that solve specific problems. Technical entrepreneurship.',
  ARRAY['coding', 'product design', 'marketing', 'persistence', 'customer research'],
  ARRAY['Innovation', 'Entrepreneurship', 'Financial Security'],
  '6-12 months',
  '$1000-5000',
  '$5-100K+/mo',
  'high',
  'Identify 3 problems in your industry, validate with 20 potential users, build an MVP in 4 weeks using no-code tools or code.',
  'This path embodies {value} through building something from nothing. High risk but unlimited upside. Your {skill} will be critical for success.'
),
(
  'Mobile App Developer',
  'tech',
  'Create iOS/Android apps for clients or build your own app products. Strong demand for mobile expertise.',
  ARRAY['Swift/Kotlin or React Native', 'UX design', 'problem-solving', 'testing', 'app store optimization'],
  ARRAY['Growth', 'Innovation', 'Financial Security'],
  '4-8 months',
  '$1000-3000',
  '$6-20K/mo',
  'medium',
  'Complete a mobile development course (free on YouTube), build 2 simple apps, publish them on app stores for portfolio.',
  'Mobile development supports {value} with continuous learning and strong market demand. Apps you build can generate passive income or client revenue.'
),
(
  'No-Code Developer/Consultant',
  'tech',
  'Build apps, websites, and automations using no-code tools like Bubble, Webflow, Airtable, and Zapier.',
  ARRAY['logical thinking', 'no-code platforms', 'UX/UI basics', 'problem-solving', 'client communication'],
  ARRAY['Innovation', 'Entrepreneurship', 'Learning'],
  '2-4 months',
  '$500-1500',
  '$4-15K/mo',
  'low',
  'Master one no-code tool (Webflow or Bubble), build 3 demo projects, share them on Twitter and NoCode communities.',
  'Perfect if you want to build without traditional coding. {value} is accessible here through rapid creation and experimentation.'
),
(
  'AI/ML Consultant',
  'tech',
  'Help businesses implement AI and machine learning solutions. Hot market with growing demand.',
  ARRAY['Python', 'machine learning', 'data analysis', 'consulting', 'communication'],
  ARRAY['Innovation', 'Impact', 'Financial Security'],
  '6-12 months',
  '$1000-3000',
  '$10-40K/mo',
  'high',
  'Take Andrew Ng\'s free ML course, build 2 AI projects solving real problems, document them thoroughly, reach out to 10 businesses.',
  'If {value} drives you, AI consulting puts you at technology\'s cutting edge with premium rates. Continuous learning required but incredibly rewarding.'
),

-- DIGITAL PRODUCT PATHS
(
  'Notion Template Creator',
  'creator',
  'Design and sell productivity templates for Notion users. Low barrier to entry, growing market.',
  ARRAY['Notion expertise', 'organization', 'design sense', 'marketing', 'customer research'],
  ARRAY['Creativity', 'Passive Income', 'Service'],
  '1-3 months',
  '$0-500',
  '$2-10K/mo',
  'low',
  'Create 3 free templates, share them on Reddit r/Notion and Twitter, gather feedback, then create 2 premium templates to sell on Gumroad.',
  'This path fits {value} by letting you help people get organized while building passive income streams. Start for free and scale based on demand.'
),
(
  'Stock Photography/Videography',
  'creator',
  'Shoot and sell photos/videos on stock platforms like Shutterstock, Adobe Stock. Visual content creation.',
  ARRAY['photography/videography', 'editing', 'composition', 'trending topics', 'consistent output'],
  ARRAY['Creativity', 'Passive Income', 'Freedom'],
  '2-4 months',
  '$1000-3000',
  '$2-8K/mo',
  'medium',
  'Shoot 50 high-quality photos in trending niches, edit them professionally, upload to 3 stock platforms with strong keywords.',
  'Your creative eye becomes passive income. If {value} matters to you, stock content earns money while you sleep, compounding over time.'
),
(
  'Digital Products (Templates, Guides, Toolkits)',
  'creator',
  'Create and sell business templates, guides, spreadsheets, or toolkits that solve specific problems.',
  ARRAY['expertise in topic', 'design', 'writing', 'marketing', 'customer research'],
  ARRAY['Service', 'Passive Income', 'Impact'],
  '1-3 months',
  '$0-500',
  '$2-12K/mo',
  'low',
  'Identify a problem you\'ve solved, create a detailed solution (template/guide), package it beautifully, sell it on Gumroad or Etsy.',
  'Turn your knowledge into products. {value} is served by helping others while building income that scales without your time.'
),
(
  'Newsletter/Substack Writer',
  'creator',
  'Build an email audience around your expertise or interests. Monetize through subscriptions, sponsorships, and affiliate links.',
  ARRAY['writing', 'consistency', 'audience building', 'research', 'email marketing'],
  ARRAY['Expression', 'Community', 'Impact'],
  '4-8 months',
  '$0-500',
  '$3-20K/mo',
  'medium',
  'Choose your niche, write 5 high-quality posts, publish weekly on Substack, share each post in 3 relevant communities.',
  'If {value} is central to you, newsletters build direct relationships with readers who value your voice. Own your audience, compound your influence.'
);

-- Verify insertion
SELECT COUNT(*) as total_templates FROM path_templates;
