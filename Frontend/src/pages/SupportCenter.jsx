import React, { useState, useRef } from 'react';
import emailjs from 'emailjs-com'; 
import "../styles/main.scss";

const SupportCenter = () => {
  const [view, setView] = useState('default');
  const [activeAccordion, setActiveAccordion] = useState(null);

  const toggleAccordion = (index, e) => {
    e.preventDefault(); 
    e.currentTarget.blur();
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  // --- SUB-COMPONENTS ---

  const Header = () => (
    <div className="bg-primary text-white text-center py-5 position-relative" >
      <div className="mb-3">
        <i className="bi bi-question-circle fs-1"></i>
      </div>
      <h2 className="fw-bold">Help & Support Center</h2>
      <p className="opacity-75">Choose from the options below to get the help you need</p>

      <div className="container" style={{ marginBottom: '-80px', marginTop: '40px' }}>
        <div className="row g-4 justify-content-center">
          <div className="col-md-5">
            <div 
              className={`card h-100 p-4 border-0 shadow-sm cursor-pointer ${view === 'guide' ? 'border border-primary border-3' : ''}`}
              onClick={() => setView('guide')}
              style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
            >
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 p-3 rounded me-3 text-primary">
                  <i className="bi bi-download fs-3"></i>
                </div>
                <div className="text-start">
                  <h6 className="fw-bold mb-1 text-dark">How to Download Your Ebook</h6>
                  <p className="text-muted small mb-1">Step-by-step guide to download your purchased ebooks.</p>
                  <span className={`small fw-bold ${view === 'guide' ? 'text-primary' : 'text-primary text-opacity-75'}`}>
                    {view === 'guide' ? 'Selected' : 'View Guide'} <i className="bi bi-arrow-right ms-1"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-5">
            <div 
              className={`card h-100 p-4 border-0 shadow-sm cursor-pointer ${view === 'support' ? 'border border-success border-3' : ''}`}
              onClick={() => setView('support')}
              style={{ cursor: 'pointer' }}
            >
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 p-3 rounded me-3 text-success">
                  <i className="bi bi-envelope fs-3"></i>
                </div>
                <div className="text-start">
                  <h6 className="fw-bold mb-1 text-dark">Need Help? Contact Support</h6>
                  <p className="text-muted small mb-1">Submit your issue and our team will assist you.</p>
                  <span className={`small fw-bold ${view === 'support' ? 'text-success' : 'text-success text-opacity-75'}`}>
                    {view === 'support' ? 'Selected' : 'Submit Query'} <i className="bi bi-arrow-right ms-1"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const DefaultView = () => (
    <div className="container py-5 mt-5">
      <div className="text-center mb-5">
        <h5 className="fw-bold">Quick Information</h5>
        <p className="text-muted">Everything you need to know about our ebook store</p>
      </div>
      <div className="row g-4">
        {[
          { icon: 'bi-file-earmark-text', title: 'Supported Formats', text: 'PDF, EPUB', color: 'purple' },
          { icon: 'bi-envelope-check', title: 'Response Time', text: 'Within 24 hours', color: 'blue' },
          { icon: 'bi-check-circle', title: 'Available 24/7', text: 'Always here to help', color: 'green' }
        ].map((item, idx) => (
          <div className="col-md-4" key={idx}>
            <div className="card h-100 p-4 border-light text-center shadow-sm rounded-4">
              <div className={`mb-3 fs-3 text-${item.color}`}>
                 <i className={`bi ${item.icon}`}></i>
              </div>
              <h6 className="fw-bold">{item.title}</h6>
              <p className="text-muted small mb-0">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const GuideView = () => (
    <div className="container py-5 mt-5">
      <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-4 mx-auto" style={{ maxWidth: '800px' }}>
        <div className="d-flex align-items-center mb-4">
          <i className="bi bi-download text-primary fs-4 me-2"></i>
          <h5 className="mb-0 fw-bold">Step-by-Step Download Guide</h5>
        </div>
        
        {[
          { icon: 'bi-box-arrow-in-right', step: 'Log in to your account', desc: 'Access your account using credentials.' },
          { icon: 'bi bi-bag-check me-2', step: 'Go to "My Orders"', desc: 'Navigate to your library section from the main menu.' },
          { icon: 'bi-file-earmark', step: 'Select the purchased ebook', desc: 'Find the ebook you want to download from your collection.' },
          { icon: 'bi-cloud-download', step: 'Click the "Download" button', desc: 'Click download.' }
        ].map((item, idx) => (
          <div className="d-flex mb-4" key={idx}>
            <div className="me-3">
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>{idx + 1}</div>
            </div>
            <div className="d-flex align-items-center flex-grow-1">
              <i className={`bi ${item.icon} text-primary me-3 fs-5`}></i>
              <div>
                <h6 className="fw-bold mb-0">{item.step}</h6>
                <p className="text-muted small mb-0">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-success bg-opacity-10 p-3 rounded-3 border border-success border-opacity-25 mt-4">
          <p className="text-success small mb-0 fw-medium">
            <i className="bi bi-check-circle-fill me-2"></i>
            <strong>Supported Formats:</strong> We currently support PDF format. EPUB coming soon.
          </p>
        </div>
      </div>
      
      <div className="card border-0 shadow-sm rounded-4 p-4 mx-auto" style={{ maxWidth: '800px' }}>
        <h5 className="fw-bold mb-4">Common Download Issues</h5>
        <div className="accordion accordion-flush" id="faqAccordion">
          {[
            { q: "What formats are supported?", a: "We support PDF and EPUB formats for all our ebooks." },
            { q: "Can I download the same ebook multiple times?", a: "Yes! There is no limit on the number of downloads." },
            { q: "How long do I have access to my purchased ebooks?", a: "Once purchased, you have lifetime access." }
          ].map((faq, i) => (
            <div className="accordion-item" key={i}>
              <h2 className="accordion-header">
                <button 
                  className={`accordion-button fw-bold small ${activeAccordion === i ? '' : 'collapsed'}`} 
                  type="button" 
                  onClick={(e) => toggleAccordion(i, e)}
                >
                  {faq.q}
                </button>
              </h2>
              <div id={`collapse${i}`} className={`accordion-collapse collapse ${activeAccordion === i ? 'show' : ''}`}>
                <div className="accordion-body text-muted small">{faq.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // --- EMAILJS INTEGRATION HERE ---
  const SupportView = () => {
    const formRef = useRef(); // Create ref to access form
    const [isSending, setIsSending] = useState(false); // Loading state

    const sendEmail = (e) => {
  e.preventDefault();
  setIsSending(true);

  // Accessing variables (Vite version)
  const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  // Use process.env.REACT_APP_... if you are using Create React App

  emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, formRef.current, PUBLIC_KEY)
    .then((result) => {
        alert("Message Sent Successfully!");
        e.target.reset();
        setIsSending(false);
    }, (error) => {
        alert("Error sending message.");
        setIsSending(false);
    });
};

    return (
      <div className="container py-5 mt-5">
        <div className="card border-0 shadow rounded-4 p-4 p-md-5 mx-auto" style={{ maxWidth: '600px' }}>
          <div className="text-center mb-4">
            <div className="bg-success bg-opacity-10 d-inline-block p-3 rounded-circle text-success mb-2">
              <i className="bi bi-envelope fs-4"></i>
            </div>
            <h5 className="fw-bold">Send Us Your Query</h5>
            <p className="text-muted small">Fill out the form and we'll respond within 24 hours</p>
          </div>

          {/* Connected ref and onSubmit */}
          <form ref={formRef} onSubmit={sendEmail}>
            <div className="mb-3">
              <label className="form-label small fw-bold">Email Address <span className="text-danger">*</span></label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-envelope"></i></span>
                {/* Added name="user_email" for EmailJS */}
                <input type="email" name="user_email" className="form-control border-start-0" placeholder="your.email@example.com" required />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label small fw-bold">Phone Number <span className="text-muted">(Optional)</span></label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted"><i className="bi bi-telephone"></i></span>
                {/* Added name="user_phone" for EmailJS */}
                <input type="tel" name="user_phone" className="form-control border-start-0" placeholder="+1 (555) 123-4567" />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label small fw-bold">Issue Category <span className="text-danger">*</span></label>
              {/* Added name="category" for EmailJS */}
              <select className="form-select" name="category" required>
                <option value="">Select category</option>
                <option value="Download Issue">Download Issue</option>
                <option value="Payment Issue">Payment Issue</option>
                <option value="Account Access">Account Access</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="form-label small fw-bold">Issue Description <span className="text-danger">*</span></label>
              {/* Added name="message" for EmailJS */}
              <textarea className="form-control" name="message" rows="4" placeholder="Please describe your issue in detail..." required></textarea>
            </div>
            <button type="submit" className="btn btn-success w-100 py-2 fw-bold mb-4" disabled={isSending}>
              {isSending ? (
                <span><i className="bi bi-hourglass-split me-2"></i> Sending...</span>
              ) : (
                <span><i className="bi bi-send me-2"></i> Submit Query</span>
              )}
            </button>
          </form>

          <div className="bg-primary bg-opacity-10 p-3 rounded text-center">
            <p className="text-primary small mb-0 fw-medium">
              <i className="bi bi-clock me-2"></i> Response Time: Within 24 hours
            </p>
          </div>
        </div>

        <div className="text-center mt-5">
          <p className="text-muted small mb-3">Prefer to reach us directly?</p>
          <div className="d-flex justify-content-center gap-4 small fw-medium">
            <a href="mailto:support@ayodebookstore.com" className="text-decoration-none text-success">
              <i className="bi bi-envelope me-1"></i> support@ayodbookstore.com
            </a>
            <span className="text-success">
              <i className="bi bi-telephone me-1"></i> +1 (555) 123-4567
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-light min-vh-100 pb-5">
      <Header />
      {view === 'default' && <DefaultView />}
      {view === 'guide' && <GuideView />}
      {view === 'support' && <SupportView />}
    </div>
  );
};

export default SupportCenter;