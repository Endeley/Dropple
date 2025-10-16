// 🔤 Dropple Thumbnail Phrase Packs (fixed, curated)
// Deterministic labels per template using stable pick logic.
// Placeholders supported: {num} {q} {city}

export const NUMBER_POOL = [10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70] as const;
export const QUARTERS = [1, 2, 3, 4] as const;
export const CITIES = ['Paris', 'Tokyo', 'Nairobi', 'Lagos', 'New York', 'London', 'Bali', 'Lisbon', 'Seoul', 'Cairo'] as const;

type PhrasePackKey =
    | 'ecommerce'
    | 'business'
    | 'resume'
    | 'presentations'
    | 'marketing'
    | 'invoices'
    | 'education'
    | 'realestate'
    | 'food'
    | 'medical'
    | 'travel'
    | 'photography'
    | 'campaigns'
    | 'tech'
    | 'logistics';

export const PHRASE_PACKS: Record<PhrasePackKey, readonly string[]> = {
    ecommerce: [
        'Flash Sale • {num}% Off',
        'New Arrivals • Shop Now',
        'Bundle & Save • Today Only',
        'Free Shipping • Limited',
        'Last Chance • {num}% Off',
        'Members Only • Early Access',
        "Weekend Sale • Don't Miss",
        'Fresh Drop • Tap to Shop',
        'Deal Zone • Save {num}%',
        'Clearance • Final Units',
        'Just In • Trending Now',
        'Price Drop • Grab It',
    ],

    business: [
        'Elevate Your Strategy',
        'Scale Your Workflow',
        'Launch With Confidence',
        'Automate & Grow',
        'Close The Gap • Execute',
        'Operate Smarter Today',
        'Lead The Market',
        'Modernize Your Stack',
        'Pitch • Win • Repeat',
        'From Plan To Impact',
        'Optimize • Deliver • Learn',
        'Momentum Starts Here',
    ],

    resume: [
        'Open to Work • {city}',
        'Hire Me • Portfolio Inside',
        'Product Manager • Ready',
        'Senior Designer • Available',
        'Software Engineer • Seeking',
        "Marketing Lead • Let's Talk",
        'Data Analyst • References Ready',
        'UX Researcher • Case Studies',
        'DevOps • Cloud & Infra',
        'Brand Strategist • Book a Call',
        'Frontend Engineer • React/TS',
        'Content Writer • Samples Inside',
    ],

    presentations: [
        'Q{q} Review • Highlights',
        "Roadmap • What's Next",
        'All-Hands • Updates',
        'Strategy Deck • 2025',
        'Launch Plan • Go-To-Market',
        'Metrics • Growth & Retention',
        'Executive Brief • Key Calls',
        'Product Vision • North Star',
        'OKRs • Alignment',
        'Insights • Decisions',
        'Sprint Recap • Demos',
        'Board Pack • Summary',
    ],

    marketing: [
        'New Collection • Live',
        'Seasonal Drop • Shop',
        'Holiday Sale • {num}% Off',
        'Back to School • Trending',
        'Creator Picks • Explore',
        'Limited Edition • Act Fast',
        'Top Sellers • Refresh',
        'Campaign Live • Join',
        'Brand Story • Watch',
        'UGC Spotlight • Share',
        'Giveaway • Enter Now',
        'Exclusive • Members Only',
    ],

    invoices: [
        'Invoice • Due',
        'Invoice • Paid',
        'Invoice • Overdue',
        'Receipt • Thank You',
        'Quote • Awaiting Approval',
        'Statement • Balance',
        'Pro-Forma • Draft',
        'Credit Note • Issued',
        'Purchase Order • Confirmed',
        'Timesheet • Approved',
        'Estimate • Sent',
        'Retainer • Received',
    ],

    education: [
        'Lesson Plan • Week {num}',
        'Study Guide • Exam Prep',
        'Class Notes • Module {num}',
        'Assignment • Due Friday',
        'Quiz Time • Review',
        'Lab Work • Steps Inside',
        'Syllabus • Overview',
        'Project Brief • Teams',
        'Reading List • Start Here',
        'Workshop • Hands-On',
        'Certification • Congrats',
        'Grade A Tips • Focus',
    ],

    realestate: [
        'Open House • Sat 11-2',
        'Just Listed • {city}',
        'Virtual Tour • Scan',
        'Move-In Ready • View Today',
        'Luxury Living • Book',
        'New Build • Register',
        'Price Reduced • Call Now',
        'City Views • High Floor',
        'Garden Unit • Pet Friendly',
        'Coastal Home • {city}',
        'Downtown Loft • Modern',
        'Family Home • Quiet Street',
    ],

    food: [
        'Chef\'s Special • Today',
        'Happy Hour • 5-7',
        'New Menu • Try Now',
        '2 for 1 • Limited',
        'Fresh Daily • Farm-to-Table',
        'Weekend Brunch • Book',
        'Street Eats • Hot',
        'Dessert First • Sweet',
        'Vegan Friendly • Yes',
        'Family Pack • Save',
        'Spicy Favorites • 🔥',
        'Order Now • Takeaway',
    ],

    medical: [
        'Stay Healthy • Book Today',
        'Check-Up • Walk-Ins Welcome',
        'Flu Shots • Available',
        'Dental Care • Smile',
        'Wellness • Mind & Body',
        'Pediatrics • Caring',
        'Cardiology • Experts',
        'Dermatology • Skin Health',
        'Pharmacy • On-Site',
        'Telehealth • From Home',
        'Vaccines • Safe & Ready',
        'Open Late • Call Now',
    ],

    travel: [
        'Explore {city} • Book Now',
        'Island Hopping • All-Inclusive',
        'Early Bird • Save {num}%',
        'Last Minute • Go!',
        'City Guide • Essentials',
        'Road Trip • Playlist On',
        'Wander More • Stories',
        'Backpacking • Light & Free',
        'Beach Days • Sunshine',
        'Mountain Trails • Fresh Air',
        'Cultural Tour • Local',
        'Food Journey • Street Bites',
    ],

    photography: [
        'Golden Hour • Book a Shoot',
        'Studio Ready • Portraits',
        'Prints Available • Shop',
        'New Series • Preview',
        'Monochrome • Classic',
        'Weddings • Moments',
        'Lifestyle • Natural',
        'Editorial • Bold',
        'Travel Set • Abroad',
        'Product Shots • Crisp',
        'Film Look • Grain',
        'Gallery Inside • View',
    ],

    campaigns: [
        'Be the Change • Join Us',
        'Act Now • Volunteer',
        'Vote Today • Make It Count',
        'Plant a Tree • Grow',
        'Save the Ocean • Share',
        'Clean Air • Together',
        'Equal Rights • Stand Up',
        'Food Drive • Donate',
        'Education for All • Support',
        'Safer Streets • Organize',
        'Health Access • Advocate',
        'Community First • Build',
    ],

    tech: [
        'AI Inside • Try It',
        'Beta Access • Join',
        'Developer Preview • Build',
        'v2.0 • Changelog',
        'Open Source • Fork',
        'Now Shipping • Hardware',
        'Edge Ready • Fast',
        'Cloud Native • Scale',
        'API First • Docs',
        'Security • Zero Trust',
        'Observability • Metrics',
        'Ship Faster • CI/CD',
    ],

    logistics: [
        'Fast Delivery • Express',
        'Global Reach • Freight',
        'Track & Trace • Live',
        'Same-Day • Book Now',
        'Next-Day • Guaranteed',
        'Cold Chain • Assured',
        'Last Mile • Reliable',
        'Fleet Ready • Quote',
        'Warehousing • Secure',
        'Customs • Cleared',
        'Door-to-Door • Simple',
        '24/7 Support • Call',
    ],
};
