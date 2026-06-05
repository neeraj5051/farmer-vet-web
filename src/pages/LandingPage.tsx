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
  Database,
  Newspaper,
  Clock,
  ArrowRight,
  Globe,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Stethoscope
} from 'lucide-react';
import logoImg from '../assets/humal-logo.jpeg';
import './LandingPage.css';
import { getDiseases, getDiseaseGroups } from '../services/diseaseService';
import { getArticles } from '../services/articleService';
import type { Article } from '../services/articleService';

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [diseaseCategories, setDiseaseCategories] = useState<any[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi'>('en');
  const [loadingArticles, setLoadingArticles] = useState(true);

  // Disease states
  const [allDiseases, setAllDiseases] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [selectedDisease, setSelectedDisease] = useState<any | null>(null);
  const [diseaseLanguage, setDiseaseLanguage] = useState<'en' | 'hi'>('en');
  const [diseaseSearchQuery, setDiseaseSearchQuery] = useState('');

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const [diseasesData, groupsData, articlesData] = await Promise.all([
          getDiseases(),
          getDiseaseGroups(),
          getArticles()
        ]);

        const mapped = groupsData.map(group => {
          const count = diseasesData.filter(d => d.group_id === group.id).length;
          return {
            id: group.id,
            name: group.name,
            name_hi: group.name_hi,
            description: group.description,
            count: `${count} Conditions`
          };
        });

        // Sort alphabetically by name
        mapped.sort((a, b) => a.name.localeCompare(b.name));
        setDiseaseCategories(mapped);
        
        // Store all diseases loaded from database
        setAllDiseases(diseasesData || []);
        
        // Show published articles
        setArticles(articlesData || []);
      } catch (error) {
        console.error("Failed to load dynamic landing data:", error);
        // Fallback to wireframe values for categories
        setDiseaseCategories([
          { name: "Hoof & Limb Disorders", count: "12 Conditions" },
          { name: "Udder & Teat Conditions", count: "8 Conditions" },
          { name: "Digestive Disorders", count: "15 Conditions" },
          { name: "Respiratory Conditions", count: "9 Conditions" },
          { name: "Metabolic Diseases", count: "7 Conditions" },
          { name: "Reproductive Conditions", count: "11 Conditions" }
        ]);
      } finally {
        setLoadingArticles(false);
      }
    };

    fetchLandingData();
  }, []);

  const handleOpenGroup = (category: any) => {
    setSelectedGroup(category);
    setSelectedDisease(null);
    setDiseaseSearchQuery('');
  };

  const handleOpenDisease = (disease: any) => {
    setSelectedDisease(disease);
    if (disease.description_hi && !disease.description) {
      setDiseaseLanguage('hi');
    } else {
      setDiseaseLanguage('en');
    }
  };

  const handleOpenDiseaseFromSearch = (disease: any) => {
    const group = diseaseCategories.find(g => g.id === disease.group_id);
    if (group) {
      setSelectedGroup(group);
    } else {
      setSelectedGroup({ id: disease.group_id, name: disease.category || 'Disease Details' });
    }
    setSelectedDisease(disease);
    if (disease.description_hi && !disease.description) {
      setDiseaseLanguage('hi');
    } else {
      setDiseaseLanguage('en');
    }
  };

  // Filter diseases dynamically based on the main directory search query
  const filteredDiseases = allDiseases.filter(d => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return false;

    const matchName = d.name?.toLowerCase().includes(query);
    const matchNameHi = d.name_hi?.toLowerCase().includes(query);
    const matchDesc = d.description?.toLowerCase().includes(query);
    const matchDescHi = d.description_hi?.toLowerCase().includes(query);
    const matchPathogenType = d.pathogen_type?.toLowerCase().includes(query);
    const matchPathogenName = d.pathogen_name?.toLowerCase().includes(query);

    const matchSymptoms = Array.isArray(d.symptoms) && d.symptoms.some((s: string) => s.toLowerCase().includes(query));
    const matchSymptomsHi = Array.isArray(d.symptoms_hi) && d.symptoms_hi.some((s: string) => s.toLowerCase().includes(query));

    const matchCauses = Array.isArray(d.causes) && d.causes.some((c: string) => c.toLowerCase().includes(query));
    const matchCausesHi = Array.isArray(d.causes_hi) && d.causes_hi.some((c: string) => c.toLowerCase().includes(query));

    return matchName || matchNameHi || matchDesc || matchDescHi || matchPathogenType || matchPathogenName || matchSymptoms || matchSymptomsHi || matchCauses || matchCausesHi;
  });

  const getBovineEmoji = (name: string): string => {
    const n = (name || "").toLowerCase();
    if (n.includes("lumpy skin") || n.includes("lsd")) return "🔴";
    if (n.includes("lumpy jaw")) return "🐂";
    if (n.includes("fog fever") || n.includes("abpee") || n.includes("respiratory")) return "🫁";
    if (n.includes("shipping fever")) return "🌡️";
    if (n.includes("foot rot") || n.includes("lameness") || n.includes("hoof")) return "🦶";
    if (n.includes("septicemia") || n.includes("hs") || n.includes("infectious")) return "🦠";
    if (n.includes("black quarter") || n.includes("bq")) return "🦵";
    if (n.includes("brucellosis")) return "🥛";
    if (n.includes("mastitis") || n.includes("udder") || n.includes("teat")) return "🐄";
    return "🩺";
  };

  const handleOpenArticle = (article: Article) => {
    setSelectedArticle(article);
    // Default to Hindi if English content is missing
    if (article.content_hi && !article.content) {
      setSelectedLanguage('hi');
    } else {
      setSelectedLanguage('en');
    }
  };

  const renderArticleContent = (text: string) => {
    if (!text) return null;
    const blocks = text.split(/\n+/);
    return blocks.map((block, index) => {
      const trimmed = block.trim();
      if (!trimmed) return null;
      const isListItem = /^\d+\.|\u2022|-|\*/.test(trimmed);
      if (isListItem) {
        return (
          <div key={index} className="modal-list-row">
            <span className="modal-bullet">•</span>
            <span className="modal-list-text">
              {trimmed.replace(/^\d+\.|\u2022|-|\*/, '').trim()}
            </span>
          </div>
        );
      }
      return (
        <p key={index} className="modal-paragraph">
          {trimmed}
        </p>
      );
    });
  };

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
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
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

        {searchQuery.trim() !== '' ? (
          <div className="search-results-section">
            <div className="search-results-header">
              <h3 className="search-results-title">
                Search Results ({filteredDiseases.length} {filteredDiseases.length === 1 ? 'Condition' : 'Conditions'} found)
              </h3>
              <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                Clear Search
              </button>
            </div>
            
            {filteredDiseases.length > 0 ? (
              <div className="search-results-grid">
                {filteredDiseases.map((disease) => {
                  const group = diseaseCategories.find(g => g.id === disease.group_id);
                  return (
                    <div 
                      key={disease.id} 
                      className="search-disease-card"
                      onClick={() => handleOpenDiseaseFromSearch(disease)}
                    >
                      <div className="search-disease-badge-row">
                        <span className="search-disease-category">
                          {group ? group.name : (disease.category || 'Livestock Condition')}
                        </span>
                        {disease.pathogen_type && (
                          <span className={`search-pathogen-tag ${disease.pathogen_type.toLowerCase()}`}>
                            {disease.pathogen_type}
                          </span>
                        )}
                      </div>
                      <h4 className="search-disease-name">
                        {disease.name}
                        {disease.name_hi && <span className="search-disease-name-hi"> ({disease.name_hi})</span>}
                      </h4>
                      {disease.description && (
                        <p className="search-disease-desc">
                          {disease.description.length > 120 
                            ? `${disease.description.substring(0, 120)}...` 
                            : disease.description}
                        </p>
                      )}
                      <div className="search-disease-footer">
                        <span className="learn-more-text">View Clinical Guidelines</span>
                        <ChevronRight size={16} className="arrow-icon" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-search-results">
                <Stethoscope size={48} className="no-results-icon" />
                <h4>No Matching Conditions Found</h4>
                <p>We couldn't find any disease or symptoms matching "{searchQuery}". Try searching for symptoms like "fever", "diarrhea", "lesions" or common terms like "FMD".</p>
              </div>
            )}
          </div>
        ) : (
          <div className="categories-grid">
            {diseaseCategories.map((category, index) => (
              <div key={index} className="category-card" onClick={() => handleOpenGroup(category)}>
                <div className="category-details">
                  <h4 className="category-name">{category.name}</h4>
                  <span className="category-count">{category.count}</span>
                </div>
                <ChevronRight className="category-arrow" size={18} />
              </div>
            ))}
          </div>
        )}

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

      {/* Pashu Gyan Section */}
      <section id="pashu-gyan" className="blog-section">
        <div className="section-header">
          <span className="section-tagline">PASHU GYAN INITIATIVE</span>
          <h2 className="section-title">Livestock Advisory & Blogs</h2>
          <p className="section-desc">
            Stay informed with verified veterinary advice, animal nutrition tips, and livestock management practices.
          </p>
        </div>

        {loadingArticles ? (
          <div className="blog-loading">
            <div className="blog-spinner"></div>
            <p>Loading latest articles...</p>
          </div>
        ) : articles.length > 0 ? (
          <div className="blog-grid">
            {articles.map((article) => {
              const displayTitle = article.title;
              const displaySnippet = article.content.replace(/<[^>]+>/g, '').substring(0, 120) + '...';
              
              return (
                <div key={article.id} className="blog-card">
                  {article.image_url ? (
                    <div className="blog-card-image-wrapper">
                      <img src={article.image_url} alt={article.title} className="blog-card-image" />
                    </div>
                  ) : (
                    <div className="blog-card-placeholder">
                      <Newspaper size={40} className="placeholder-icon" />
                    </div>
                  )}
                  <div className="blog-card-content">
                    <div className="blog-card-meta">
                      <span className="blog-card-category">{article.category}</span>
                      <span className="blog-card-date">
                        <Clock size={12} className="meta-icon" />
                        {new Date(article.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="blog-card-title">{displayTitle}</h3>
                    {article.title_hi && (
                      <h4 className="blog-card-title-hi">{article.title_hi}</h4>
                    )}
                    <p className="blog-card-snippet">{displaySnippet}</p>
                    <button 
                      onClick={() => handleOpenArticle(article)}
                      className="blog-card-cta"
                    >
                      <span>Read Article</span>
                      <ArrowRight size={16} className="cta-icon" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="blog-empty">
            <Newspaper size={48} className="empty-icon" />
            <p>No advisory articles available right now. Check back soon!</p>
          </div>
        )}
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

      {/* Blog Detail Modal */}
      {selectedArticle && (
        <div className="blog-modal-backdrop" onClick={() => setSelectedArticle(null)}>
          <div className="blog-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="blog-modal-close" onClick={() => setSelectedArticle(null)} aria-label="Close">
              &times;
            </button>

            {selectedArticle.image_url ? (
              <div className="blog-modal-hero">
                <img src={selectedArticle.image_url} alt={selectedArticle.title} className="blog-modal-image" />
              </div>
            ) : (
              <div className="blog-modal-placeholder">
                <Newspaper size={60} />
              </div>
            )}

            <div className="blog-modal-body">
              <div className="blog-modal-meta">
                <span className="blog-modal-category">{selectedArticle.category}</span>
                <span className="blog-modal-date">{new Date(selectedArticle.created_at).toLocaleDateString()}</span>
                
                {/* Language Toggle Pills */}
                {selectedArticle.content_hi && selectedArticle.content && (
                  <div className="language-toggle">
                    <button 
                      onClick={() => setSelectedLanguage('en')}
                      className={`lang-pill ${selectedLanguage === 'en' ? 'active' : ''}`}
                    >
                      <Globe size={12} className="pill-icon" />
                      English
                    </button>
                    <button 
                      onClick={() => setSelectedLanguage('hi')}
                      className={`lang-pill ${selectedLanguage === 'hi' ? 'active' : ''}`}
                    >
                      <Globe size={12} className="pill-icon" />
                      हिंदी
                    </button>
                  </div>
                )}
              </div>

              <h2 className="blog-modal-title">
                {selectedLanguage === 'hi' && selectedArticle.title_hi 
                  ? selectedArticle.title_hi 
                  : selectedArticle.title}
              </h2>

              <div className="blog-modal-divider"></div>

              <div className="blog-modal-text">
                {selectedLanguage === 'hi' && selectedArticle.content_hi
                  ? renderArticleContent(selectedArticle.content_hi)
                  : renderArticleContent(selectedArticle.content)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disease Directory Modal */}
      {selectedGroup && (
        <div className="blog-modal-backdrop" onClick={() => setSelectedGroup(null)}>
          <div className="blog-modal-content" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="disease-modal-header">
              {selectedDisease ? (
                <button 
                  className="disease-modal-back" 
                  onClick={() => setSelectedDisease(null)}
                >
                  <ArrowLeft size={18} />
                  <span>Back to {selectedGroup.name}</span>
                </button>
              ) : (
                <h3 className="disease-modal-group-title">
                  {selectedGroup.name}
                </h3>
              )}
              <button className="blog-modal-close-static" onClick={() => setSelectedGroup(null)} aria-label="Close">
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="blog-modal-body disease-modal-body">
              
              {/* CASE 1: Disease List */}
              {!selectedDisease ? (
                <div className="disease-list-view">
                  <p className="disease-group-desc">
                    {selectedGroup.description || `Browse veterinary guidelines and clinical profiles for ${selectedGroup.name.toLowerCase()}.`}
                  </p>
                  
                  {/* Search bar inside category */}
                  <div className="disease-search-box">
                    <Search size={18} className="search-box-icon" />
                    <input 
                      type="text" 
                      placeholder="Search diseases in this category..."
                      value={diseaseSearchQuery}
                      onChange={(e) => setDiseaseSearchQuery(e.target.value)}
                      className="disease-search-input"
                    />
                  </div>

                  {/* Diseases list grid */}
                  <div className="disease-items-grid">
                    {allDiseases
                      .filter(d => d.group_id === selectedGroup.id)
                      .filter(d => 
                        d.name.toLowerCase().includes(diseaseSearchQuery.toLowerCase()) || 
                        (d.name_hi && d.name_hi.includes(diseaseSearchQuery))
                      )
                      .map((disease) => (
                        <div 
                          key={disease.id} 
                          className="disease-item-card" 
                          onClick={() => handleOpenDisease(disease)}
                        >
                          <div className="disease-item-emoji">
                            {disease.image_path && disease.image_path.length <= 4 
                              ? disease.image_path 
                              : getBovineEmoji(disease.name)}
                          </div>
                          <div className="disease-item-info">
                            <h4 className="disease-item-name">{disease.name}</h4>
                            {disease.name_hi && <span className="disease-item-name-hi">{disease.name_hi}</span>}
                            {disease.pathogen_type && (
                              <span className="disease-item-pathogen">{disease.pathogen_type}</span>
                            )}
                          </div>
                          <ChevronRight size={16} className="disease-item-arrow" />
                        </div>
                      ))}
                    {allDiseases.filter(d => d.group_id === selectedGroup.id).length === 0 && (
                      <div className="disease-list-empty">
                        <Stethoscope size={40} className="empty-icon" />
                        <p>No diseases currently loaded for this category.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="disease-details-view">
                  {/* CASE 2: Disease Details */}
                  <div className="blog-modal-meta disease-meta">
                    <span className="blog-modal-category">{selectedDisease.category || 'Clinical Advisory'}</span>
                    
                    {/* Language Toggle Pills */}
                    {(selectedDisease.description_hi || selectedDisease.symptoms_hi || selectedDisease.treatments_hi) && (
                      <div className="language-toggle">
                        <button 
                          onClick={() => setDiseaseLanguage('en')}
                          className={`lang-pill ${diseaseLanguage === 'en' ? 'active' : ''}`}
                        >
                          <Globe size={12} className="pill-icon" />
                          English
                        </button>
                        <button 
                          onClick={() => setDiseaseLanguage('hi')}
                          className={`lang-pill ${diseaseLanguage === 'hi' ? 'active' : ''}`}
                        >
                          <Globe size={12} className="pill-icon" />
                          हिंदी
                        </button>
                      </div>
                    )}
                  </div>

                  <h2 className="disease-title-large">
                    {diseaseLanguage === 'hi' && selectedDisease.name_hi 
                      ? selectedDisease.name_hi 
                      : selectedDisease.name}
                  </h2>

                  <div className="blog-modal-divider"></div>

                  {/* Description */}
                  {(diseaseLanguage === 'hi' ? selectedDisease.description_hi : selectedDisease.description) && (
                    <div className="disease-detail-section">
                      <h4 className="disease-section-header">Description</h4>
                      <p className="disease-description-text">
                        {diseaseLanguage === 'hi' && selectedDisease.description_hi 
                          ? selectedDisease.description_hi 
                          : selectedDisease.description}
                      </p>
                    </div>
                  )}

                  {/* Symptoms */}
                  <div className="disease-detail-section">
                    <h4 className="disease-section-header">Symptoms & Clinical Signs</h4>
                    <div className="disease-details-card">
                      {((diseaseLanguage === 'hi' && selectedDisease.symptoms_hi ? selectedDisease.symptoms_hi : selectedDisease.symptoms) || []).map((symptom: string, idx: number) => (
                        <div key={idx} className="disease-detail-row">
                          <CheckCircle size={16} className="detail-row-icon check" />
                          <span className="detail-row-text">{symptom}</span>
                        </div>
                      ))}
                      {(!selectedDisease.symptoms || selectedDisease.symptoms.length === 0) && (
                        <p className="disease-detail-empty">No clinical symptoms specified.</p>
                      )}
                    </div>
                  </div>

                  {/* Causes */}
                  {((diseaseLanguage === 'hi' && selectedDisease.causes_hi ? selectedDisease.causes_hi : selectedDisease.causes) || []).length > 0 && (
                    <div className="disease-detail-section">
                      <h4 className="disease-section-header">Transmission & Causes</h4>
                      <div className="disease-details-card highlighted">
                        {((diseaseLanguage === 'hi' && selectedDisease.causes_hi ? selectedDisease.causes_hi : selectedDisease.causes) || []).map((cause: string, idx: number) => (
                          <div key={idx} className="disease-detail-row">
                            <AlertCircle size={16} className="detail-row-icon alert" />
                            <span className="detail-row-text">{cause}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pathogen */}
                  {(selectedDisease.pathogen_type || selectedDisease.pathogen_name) && (
                    <div className="disease-detail-section">
                      <h4 className="disease-section-header">Pathogen Profile</h4>
                      <div className="disease-pathogen-card">
                        {selectedDisease.pathogen_type && (
                          <div className="pathogen-row">
                            <span className="pathogen-label">Type:</span>
                            <span className="pathogen-value">{selectedDisease.pathogen_type}</span>
                          </div>
                        )}
                        {selectedDisease.pathogen_name && (
                          <div className="pathogen-row">
                            <span className="pathogen-label">Agent:</span>
                            <span className="pathogen-value agent">{selectedDisease.pathogen_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Treatment */}
                  {((diseaseLanguage === 'hi' && selectedDisease.treatments_hi ? selectedDisease.treatments_hi : selectedDisease.treatments) || []).length > 0 && (
                    <div className="disease-detail-section">
                      <h4 className="disease-section-header">Treatment & Management</h4>
                      <div className="disease-details-card">
                        {((diseaseLanguage === 'hi' && selectedDisease.treatments_hi ? selectedDisease.treatments_hi : selectedDisease.treatments) || []).map((treatment: string, idx: number) => (
                          <div key={idx} className="disease-detail-row">
                            <Stethoscope size={16} className="detail-row-icon treatment" />
                            <span className="detail-row-text">{treatment}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
