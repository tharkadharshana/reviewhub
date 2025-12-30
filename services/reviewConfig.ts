export interface CategoryInput {
    id: string;
    label: string;
    placeholder: string;
    type: string;
}

export interface CategoryConfig {
    id: string;
    label: string;
    icon: string;
    color: string;
    title: string;
    inputLabel: string;
    inputPlaceholder: string;
    platforms: string[];
    tags: {
        positive: string[];
        negative: string[];
    };
    secondaryInputs?: CategoryInput[];
}

export const REVIEW_CONFIG: CategoryConfig[] = [
    {
        id: 'ride_share',
        label: 'Ride Share',
        icon: 'local_taxi',
        color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
        title: "Ride Share Experience",
        inputLabel: "Vehicle Number (Required)",
        inputPlaceholder: "e.g., WP ABC-1234",
        platforms: ["PickMe", "Uber", "Kangaroo", "TukTuk", "Street Hail", "Savari", "MrRider"],
        tags: {
            positive: ["Clean Vehicle", "Safe Driving", "AC On", "Polite Driver", "Shortest Route", "Fair Price", "Returned Balance", "English Speaking", "On-Time Arrival", "Helpful with Luggage"],
            negative: ["Demanding Cash", "Refused Card", "High Traffic Route", "Fuel Stop Delay", "Driver Mismatch", "Vehicle Mismatch", "Phone While Driving", "Rude/Aggressive", "Modified Meter", "No Balance Change", "Sexual Harassment", "Reckless Driving"]
        },
        secondaryInputs: [
            { id: "driverName", label: "Driver Name (Opt)", placeholder: "e.g. Kamal", type: "text" },
            { id: "phoneNumber", label: "Mobile Number (Opt)", placeholder: "07x xxxxxxx", type: "tel" }
        ]
    },
    {
        id: 'online_seller',
        label: 'Online Seller',
        icon: 'shopping_bag',
        color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        title: "Online Purchase",
        inputLabel: "Page Name / Website / Link",
        inputPlaceholder: "e.g., FashionStore.lk or FB Link",
        platforms: ["Facebook", "Instagram", "Ikman.lk", "Daraz", "TikTok", "WhatsApp Group", "Kapruka", "Amazon"],
        tags: {
            positive: ["Fast Delivery", "Item as Described", "Good Packaging", "Responsive", "Genuine Product", "Warranty Honored", "Easy Returns"],
            negative: ["No Delivery", "Fake Item", "Blocked Me", "Damaged Item", "Wrong Item", "Cash on Delivery Scam", "Hidden Charges", "Delayed Shipping"]
        },
        secondaryInputs: [
            { id: "phoneNumber", label: "Mobile Number (Opt)", placeholder: "07x xxxxxxx", type: "tel" }
        ]
    },
    {
        id: 'phone_scam',
        label: 'Phone/Spam',
        icon: 'phone_locked',
        color: 'text-red-500 bg-red-500/10 border-red-500/20',
        title: "Phone / WhatsApp Report",
        inputLabel: "Phone Number",
        inputPlaceholder: "e.g., 077 123 4567",
        platforms: ["WhatsApp", "Voice Call", "SMS", "Viber", "Telegram", "MyDialog", "Mobitel App"],
        tags: {
            positive: ["Helpful Support Call", "Legitimate Offer"],
            negative: ["Lottery Scam", "Bank OTP Scam", "Customs Gift Scam", "Data Entry Job", "Harassment", "Wrong Number", "Silent Call", "Investment Fraud"]
        }
    },
    {
        id: 'business',
        label: 'Business',
        icon: 'store',
        color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
        title: "Business Review",
        inputLabel: "Business Name",
        inputPlaceholder: "e.g., Downtown Cafe",
        platforms: ["Keells", "Cargills", "Arpico", "Local Shops"],
        tags: {
            positive: ["Great Service", "Tasty Food", "Good Ambience", "Value for Money", "Clean Hygiene", "Friendly Staff", "Quick Checkout"],
            negative: ["Bad Service", "Hidden Charges", "Hygiene Issue", "Rude Staff", "Long Wait Time", "Overpriced", "Expired Goods"]
        },
        secondaryInputs: [
            { id: "location", label: "Location (Opt)", placeholder: "e.g., Colombo 07", type: "text" },
            { id: "phoneNumber", label: "Mobile Number (Opt)", placeholder: "07x xxxxxxx", type: "tel" }
        ]
    },
    {
        id: 'freelancer',
        label: 'Person/Pro',
        icon: 'person',
        color: 'text-green-500 bg-green-500/10 border-green-500/20',
        title: "Person / Freelancer",
        inputLabel: "Name / Service",
        inputPlaceholder: "e.g., Visa Consultant, Money Lender",
        platforms: ["Word of Mouth", "Facebook", "Recommendation", "Ikman.lk", "LinkedIn"],
        tags: {
            positive: ["Professional", "On Time", "High Quality", "Good Communication", "Trustworthy", "Affordable Rates"],
            negative: ["Fraud", "Late Work", "Ghosted", "Bad Quality", "Overcharged", "Unprofessional", "False Promises"]
        },
        secondaryInputs: [
            { id: "phoneNumber", label: "Mobile Number (Opt)", placeholder: "07x xxxxxxx", type: "tel" }
        ]
    },
    {
        id: 'food_delivery',
        label: 'Food Delivery',
        icon: 'restaurant',
        color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
        title: "Food Delivery Experience",
        inputLabel: "Restaurant Name or Order ID",
        inputPlaceholder: "e.g., KFC Colombo or Order #12345",
        platforms: ["PickMe Food", "Uber Eats", "Savari Food", "MrRider", "Kapruka", "Glovo"],
        tags: {
            positive: ["Fast Delivery", "Hot Food", "Accurate Order", "Polite Rider", "Good Packaging", "Fresh Ingredients"],
            negative: ["Late Delivery", "Cold Food", "Wrong Order", "Rude Rider", "Damaged Packaging", "Missing Items", "Overpriced Delivery Fee"]
        },
        secondaryInputs: [
            { id: "deliveryPerson", label: "Delivery Person Name (Opt)", placeholder: "e.g., Ravi", type: "text" },
            { id: "phoneNumber", label: "Mobile Number (Opt)", placeholder: "07x xxxxxxx", type: "tel" }
        ]
    },
    {
        id: 'tourism',
        label: 'Tourism',
        icon: 'beach_access',
        color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
        title: "Tourism Experience",
        inputLabel: "Attraction/Hotel/Tour Name",
        inputPlaceholder: "e.g., Sigiriya Rock or Galle Fort Hotel",
        platforms: ["Sri Lanka Tourism", "TripAdvisor", "Airbnb", "Booking.com"],
        tags: {
            positive: ["Beautiful Views", "Well-Maintained", "Friendly Guides", "Value for Money", "Clean Facilities", "Safe Environment"],
            negative: ["Overcrowded", "Entry Fee Scam", "Poor Maintenance", "Rude Staff", "Hidden Charges", "Fake Guides", "Tourist Trap"]
        },
        secondaryInputs: [
            { id: "location", label: "Location (Opt)", placeholder: "e.g., Kandy", type: "text" },
            { id: "phoneNumber", label: "Mobile Number (Opt)", placeholder: "07x xxxxxxx", type: "tel" }
        ]
    },
    {
        id: 'healthcare',
        label: 'Healthcare',
        icon: 'local_hospital',
        color: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
        title: "Healthcare Review",
        inputLabel: "Hospital/Doctor Name",
        inputPlaceholder: "e.g., Asiri Hospital or Dr. Silva",
        platforms: ["Government Hospitals", "Asiri", "Nawaloka", "Durdans", "Lanka Hospitals"],
        tags: {
            positive: ["Quick Service", "Expert Doctors", "Clean Facility", "Affordable Treatment", "Friendly Nurses", "Accurate Diagnosis"],
            negative: ["Long Queues", "Rude Staff", "Overcharged", "Misdiagnosis", "Dirty Environment", "Medicine Shortage"]
        },
        secondaryInputs: [
            { id: "specialty", label: "Specialty (Opt)", placeholder: "e.g., Cardiology", type: "text" },
            { id: "phoneNumber", label: "Mobile Number (Opt)", placeholder: "07x xxxxxxx", type: "tel" }
        ]
    },
    {
        id: 'education',
        label: 'Education',
        icon: 'school',
        color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
        title: "Education Review",
        inputLabel: "School/Tutor/Class Name",
        inputPlaceholder: "e.g., Royal College or Math Tutor Priya",
        platforms: ["Government Schools", "Private Tutors", "International Schools"],
        tags: {
            positive: ["Excellent Teaching", "Supportive Staff", "Good Facilities", "Affordable Fees", "High Success Rate"],
            negative: ["Poor Teaching", "Overcrowded Classes", "High Fees", "Corruption", "Bullying Issues", "Outdated Curriculum"]
        },
        secondaryInputs: [
            { id: "subject", label: "Subject/Level (Opt)", placeholder: "e.g., O/L Maths", type: "text" },
            { id: "phoneNumber", label: "Mobile Number (Opt)", placeholder: "07x xxxxxxx", type: "tel" }
        ]
    },
    {
        id: 'real_estate',
        label: 'Real Estate',
        icon: 'home',
        color: 'text-stone-500 bg-stone-500/10 border-stone-500/20',
        title: "Real Estate Review",
        inputLabel: "Property/Agent Name",
        inputPlaceholder: "e.g., Colombo Apartment or Lanka Property Web",
        platforms: ["LankaPropertyWeb", "Ikman.lk Rentals", "Facebook Groups", "Agents"],
        tags: {
            positive: ["Good Location", "Fair Price", "Well-Maintained", "Helpful Agent", "Secure Building", "Clear Deeds"],
            negative: ["Fake Listings", "Overpriced Rent", "Hidden Fees", "Poor Condition", "Scam Agent", "No Refund Deposit"]
        },
        secondaryInputs: [
            { id: "location", label: "Location (Opt)", placeholder: "e.g., Borella", type: "text" },
            { id: "phoneNumber", label: "Mobile Number (Opt)", placeholder: "07x xxxxxxx", type: "tel" }
        ]
    },
    {
        id: 'telecom',
        label: 'Telecom',
        icon: 'wifi',
        color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
        title: "Telecom Review",
        inputLabel: "Provider Name",
        inputPlaceholder: "e.g., Dialog or Mobitel",
        platforms: ["Dialog", "Mobitel", "SLT", "Airtel", "Hutch"],
        tags: {
            positive: ["Strong Signal", "Fast Internet", "Good Customer Support", "Affordable Plans", "Reliable Connection"],
            negative: ["Poor Coverage", "Slow Speed", "Billing Errors", "Rude Support", "Hidden Charges", "Frequent Outages"]
        },
        secondaryInputs: [
            { id: "serviceType", label: "Service Type (Opt)", placeholder: "e.g., Broadband", type: "text" },
            { id: "phoneNumber", label: "Mobile Number (Opt)", placeholder: "07x xxxxxxx", type: "tel" }
        ]
    },
    {
        id: 'banking',
        label: 'Banking',
        icon: 'account_balance',
        color: 'text-yellow-600 bg-yellow-600/10 border-yellow-600/20',
        title: "Banking Review",
        inputLabel: "Bank Name",
        inputPlaceholder: "e.g., Bank of Ceylon (BOC)",
        platforms: ["BOC", "People's Bank", "Commercial Bank", "HNB", "Sampath Bank", "NSB"],
        tags: {
            positive: ["Quick Transactions", "Helpful Staff", "Secure App", "Low Fees", "Good Interest Rates"],
            negative: ["Long Queues", "High Fees", "App Crashes", "Fraud Alerts Ignored", "Hidden Charges"]
        },
        secondaryInputs: [
            { id: "branch", label: "Branch (Opt)", placeholder: "e.g., Colombo Main", type: "text" },
            { id: "phoneNumber", label: "Mobile Number (Opt)", placeholder: "07x xxxxxxx", type: "tel" }
        ]
    },
    {
        id: 'other',
        label: 'Other',
        icon: 'category',
        color: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
        title: "General Review",
        inputLabel: "Subject",
        inputPlaceholder: "What is this about?",
        platforms: [],
        tags: {
            positive: ["Good Experience", "Helpful", "Legit", "Reliable"],
            negative: ["Scam", "Bad Experience", "Waste of Time", "Fraudulent"]
        },
        secondaryInputs: [
            { id: "phoneNumber", label: "Mobile Number (Opt)", placeholder: "07x xxxxxxx", type: "tel" }
        ]
    }
];