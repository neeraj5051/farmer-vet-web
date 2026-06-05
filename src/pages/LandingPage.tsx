import { useState, useEffect } from 'react';
import { 
  Phone, 
  UserCheck, 
  MapPin, 
  Video, 
  Activity, 
  ShieldCheck, 
  Search, 
  ChevronRight, 
  BookOpen, 
  Download, 
  FileText,
  Heart,
  TrendingUp,
  Sliders,
  Database
} from 'lucide-react';
import logoImg from '../assets/humal-logo.jpeg';
import './LandingPage.css';
import { getDiseases, getDiseaseGroups } from '../services/diseaseService';

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [diseaseCategories, setDiseaseCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const [diseasesData, groupsData] = await Promise.all([
          getDiseases(),
          getDiseaseGroups()
        ]);

        const mapped = groupsData.map(group => {
          const count = diseasesData.filter(d => d.group_id === group.id).length;
          return {
            id: group.id,
            name: group.name,
            name_hi: group.name_hi,
            count: `${count} Conditions`
          };
        });

        // Sort alphabetically by name
        mapped.sort((a, b) => a.name.localeCompare(b.name));
        setDiseaseCategories(mapped);
      } catch (error) {
        console.error("Failed to load disease groups dynamically:", error);
        // Fallback to wireframe values
        setDiseaseCategories([
          { name: "Hoof & Limb Disorders", count: "12 Conditions" },
          { name: "Udder & Teat Conditions", count: "8 Conditions" },
          { name: "Digestive Disorders", count: "15 Conditions" },
          { name: "Respiratory Conditions", count: "9 Conditions" },
          { name: "Metabolic Diseases", count: "7 Conditions" },
          { name: "Reproductive Conditions", count: "11 Conditions" }
        ]);
      }
    };

    fetchCategories();
  }, []);

  const services = [
    {
      icon: <Video className="service-icon" />,
      title: "Online Teleconsultation",
      description: "Instantly connect with veterinarians on our network over phone/video."
    },
    {
      icon: <MapPin className="service-icon" />,
      title: "In-person Visit",
      description: "Book qualified local vets for emergency treatment and request them to visit your farm."
    },
    {
      icon: <Activity className="service-icon" />,
      title: "Artificial Insemination",
      description: "Premium genetics & sex-sorted insemination to improve yield."
    },
    {
      icon: <ShieldCheck className="service-icon" />,
      title: "Vaccination",
      description: "Protect your livestock against deadly diseases through timely vaccination."
    }
  ];

  return (
    <div className="landing-container">
      {/* Navigation Header */}
      <header className="navbar">
        <div className="nav-brand">
          <img src={logoImg} alt="Humal Logo" className="nav-logo" />
        </div>
        <nav className="nav-menu">
          <a href="#services" className="nav-link">Services</a>
          <a href="#disease-directory" className="nav-link">Disease Directory</a>
          <a href="#vets" className="nav-link">For Vets</a>
          <a href="#about" className="nav-link">About Us</a>
        </nav>
        <div className="nav-actions">
          <a href="/admin/login" className="btn-secondary admin-btn">Admin Portal</a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="pilot-badge">
            <MapPin size={16} />
            <span>Currently piloting with trusted clinics across Bihar</span>
          </div>
          
          <h1 className="hero-title">
            Welcome to India's <span className="highlight">Livestock Healthcare</span> Network
          </h1>
          <p className="hero-subtitle">
            Connect with verified veterinarians, access disease intelligence, and book breeding services – all from a single platform.
          </p>

          <div className="hero-ctas">
            <a href="#download" className="btn-primary app-download-btn">
              <Phone size={18} />
              <span>Download Farmer App</span>
            </a>
            <a href="#vets" className="btn-outline partner-vet-btn">
              <UserCheck size={18} />
              <span>Join as a Partner Vet</span>
            </a>
          </div>
        </div>
        
        {/* Visual Element decoration */}
        <div className="hero-bg-shapes">
          <div className="shape-blur shape-1"></div>
          <div className="shape-blur shape-2"></div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="section-header">
          <span className="section-tagline">OUR OFFERINGS</span>
          <h2 className="section-title">What We Do</h2>
          <p className="section-desc">Comprehensive veterinary and dairy support tailored for Indian livestock owners.</p>
        </div>

        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-icon-wrapper">
                {service.icon}
              </div>
              <h3 className="service-card-title">{service.title}</h3>
              <p className="service-card-desc">{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Veterinarian Section */}
      <section id="vets" className="vet-section">
        <div className="vet-container">
          <div className="vet-text-side">
            <span className="section-tagline light">VET COMPANION</span>
            <h2 className="section-title text-white">Are You a Licensed Veterinarian?</h2>
            <p className="section-desc text-white-offset">
              Manage your field practice efficiently and reach more farmers in need. Humal provides a digital workflow designed specifically for mobile veterinarians.
            </p>
            <a href="#contact" className="btn-white">Join as a Partner Vet</a>
          </div>

          <div className="vet-features-side">
            <div className="vet-feature-card">
              <Sliders className="feature-icon" />
              <div>
                <h4 className="feature-title">Flexible Procedure Fees</h4>
                <p className="feature-desc">Set your own custom fees for consultation, physical visits, artificial insemination, or vaccinations.</p>
              </div>
            </div>
            
            <div className="vet-feature-card">
              <Database className="feature-icon" />
              <div>
                <h4 className="feature-title">Digitized Records</h4>
                <p className="feature-desc">Digitize and store clinical diagnostics, animal records, and prescription history cleanly without manual paperwork.</p>
              </div>
            </div>

            <div className="vet-feature-card">
              <TrendingUp className="feature-icon" />
              <div>
                <h4 className="feature-title">Practice Insights</h4>
                <p className="feature-desc">Keep track of your total monthly earnings, consultation analytics, and upcoming visits in a single app.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disease Directory Section */}
      <section id="disease-directory" className="directory-section">
        <div className="section-header">
          <span className="section-tagline">CLINICAL DATABASE</span>
          <h2 className="section-title">Expert Curated Livestock Disease Directory</h2>
          <p className="section-desc">
            Search and browse through an exhaustive directory of comprehensive bovine and livestock conditions built directly from peer-reviewed clinical data. Look up symptoms, transmission causes, and diagnostics guidelines cleanly on your phone or web dashboard.
          </p>
        </div>

        <div className="directory-search-wrapper">
          <div className="search-bar">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Search symptoms, diseases (e.g. FMD, Brucellosis...)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="categories-grid">
          {diseaseCategories.map((category, index) => (
            <div key={index} className="category-card">
              <div className="category-details">
                <h4 className="category-name">{category.name}</h4>
                <span className="category-count">{category.count}</span>
              </div>
              <ChevronRight className="category-arrow" size={18} />
            </div>
          ))}
        </div>

        <div className="directory-ctas">
          <a href="#clinical" className="btn-primary">
            <BookOpen size={18} />
            <span>Explore Full Clinical Directory</span>
          </a>
          <a href="#join" className="btn-outline">Join Humal</a>
        </div>
        
        <div className="download-pdf-wrapper">
          <a href="#download-pdf" className="download-pdf-link">
            <FileText size={16} />
            <span>Download PDF Disease Directory Directory</span>
          </a>
        </div>
      </section>

      {/* Footer Section */}
      <footer id="about" className="footer">
        <div className="footer-top">
          <div className="footer-brand-col">
            <img src={logoImg} alt="Humal Logo" className="footer-logo" />
            <p className="footer-tagline">Digitizing and scaling livestock healthcare across India.</p>
            <div className="pashu-gyan-section">
              <div className="pashu-gyan-badge">
                <Heart className="heart-icon animate-pulse" size={16} />
                <span>Pashu Gyan Initiative</span>
              </div>
              <a href="#download" className="btn-small-download">
                <Download size={14} />
                <span>Download App</span>
              </a>
            </div>
          </div>

          <div className="footer-links-col">
            <h5 className="footer-col-title">Company</h5>
            <ul className="footer-links">
              <li><a href="#about">About Us</a></li>
              <li><a href="#vets">Partner Vets</a></li>
              <li><a href="#careers">Careers</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h5 className="footer-col-title">Resources</h5>
            <ul className="footer-links">
              <li><a href="#disease-directory">Disease Library</a></li>
              <li><a href="#guide">App Guide</a></li>
              <li><a href="#support">Support System</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h5 className="footer-col-title">Legal</h5>
            <ul className="footer-links">
              <li><a href="#terms">Terms & Conditions</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#vet-agreement">Vet Agreement Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">&copy; {new Date().getFullYear()} Humal Tech Private Limited. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
