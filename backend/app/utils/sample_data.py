from typing import List, Dict, Any

MOCK_SAMPLES: List[Dict[str, Any]] = [
    {
        "id": "sample-fake-job-offer",
        "title": "Fake Tech Job Offer (Advance Fee & Telegram)",
        "subtitle": "Refundable equipment deposit + Telegram redirect + Gmail recruiter",
        "category": "Employment Fraud",
        "scan_type": "text",
        "content": (
            "Dear Candidate,\n\n"
            "We are pleased to offer you the position of Senior Cloud Systems Engineer at Google India. "
            "Your starting salary will be $145,000 USD per annum with comprehensive health coverage.\n\n"
            "Due to remote equipment logistics, you are required to deposit a refundable security deposit "
            "of $450 to our verified Bitcoin wallet (bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh) or via Zelle "
            "to cover transit insurance and your customized Apple MacBook M3 workstation. "
            "This payment will be 100% reimbursed on your first payroll cycle.\n\n"
            "Failure to complete the deposit within 24 hours will forfeit your candidacy.\n\n"
            "Please connect immediately with our Talent Acquisition Director on Telegram at @GoogleLeadRecruiter "
            "and confirm your payment receipt.\n\n"
            "Warm regards,\n"
            "Google Talent Acquisition Team\n"
            "recruitment.google.team@gmail.com\n"
            "Portal: https://careers-google-verify.xyz/onboarding"
        ),
        "target_url": "https://careers-google-verify.xyz/onboarding",
        "sender_email": "recruitment.google.team@gmail.com",
        "expected_threat_tier": "CRITICAL_SCAM",
    },
    {
        "id": "sample-rental-scam",
        "title": "Rental Deposit Escrow Trap (Landlord Abroad)",
        "subtitle": "Advance wire before physical viewing + Landlord abroad",
        "category": "Rental Fraud",
        "scan_type": "text",
        "content": (
            "Dear Tenant,\n\n"
            "Thank you for your interest in our furnished 2-bedroom luxury apartment at 440 Park Avenue. "
            "The monthly rent is $1,200 with all utilities included.\n\n"
            "I am currently abroad in the United Kingdom serving on an emergency medical missionary mission, "
            "so I cannot meet you for an in-person walkthrough immediately. "
            "To secure the apartment and prevent other applicants from taking it, you must wire the first month "
            "rent and security deposit of $1,200 before viewing to my personal Western Union account.\n\n"
            "Once the wire transfer is confirmed, the keys will be dispatched via FedEx courier directly to your current address within 24 hours.\n\n"
            "Contact me on WhatsApp: +44 7700 900123.\n\n"
            "Best,\n"
            "Dr. Richard Sterling (Owner)"
        ),
        "target_url": "https://parkave-luxury-rentals.top/lease-agreement",
        "sender_email": "sterling.properties440@yahoo.com",
        "expected_threat_tier": "CRITICAL_SCAM",
    },
    {
        "id": "sample-phishing-url",
        "title": "Spoofed Banking Portal (Typosquat & Urgency)",
        "subtitle": "Urgent security verification + 2-hour deadline",
        "category": "Credential Harvesting",
        "scan_type": "url",
        "content": (
            "URGENT SECURITY ALERT: Unauthorized sign-in attempt detected on your checking account. "
            "Your access will be suspended within 2 hours unless you re-authenticate your identity.\n\n"
            "Click here immediately: https://secure-bank-login-verify.com/auth\n\n"
            "Do not share your one-time passcode with anyone."
        ),
        "target_url": "https://secure-bank-login-verify.com/auth",
        "sender_email": "alerts@online-bank-update.xyz",
        "expected_threat_tier": "CRITICAL_SCAM",
    },
    {
        "id": "sample-legitimate-offer",
        "title": "Legitimate Enterprise Appointment Letter",
        "subtitle": "Authentic corporate domain + Zero candidate fees + Official HR portal",
        "category": "Legitimate Offer",
        "scan_type": "text",
        "content": (
            "Dear Candidate,\n\n"
            "Microsoft Corporation is pleased to extend an offer of employment for the role of Senior Software Engineer. "
            "Your annualized base salary will be $165,000 USD with standard corporate equity grants.\n\n"
            "All hardware, including your laptop and security key, will be provisioned directly by Microsoft IT Logistics "
            "at zero cost to you.\n\n"
            "Please review and sign your formal offer letter through our secure corporate employee portal at "
            "https://careers.microsoft.com/us/en/onboarding using your candidate ID. "
            "If you have any questions, reach out directly to your assigned recruiter Sarah Jenkins at sjenkins@microsoft.com.\n\n"
            "Sincerely,\n"
            "Microsoft Global Talent Acquisition\n"
            "One Microsoft Way, Redmond, WA"
        ),
        "target_url": "https://careers.microsoft.com/us/en/onboarding",
        "sender_email": "sjenkins@microsoft.com",
        "expected_threat_tier": "SAFE",
    },
]
