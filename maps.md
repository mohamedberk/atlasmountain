CSS:                                                                                        
                                                                                              
  /* ===== MAP SECTION ===== */                                                               
  .map-section {                                                                              
      background: var(--bg-light);                                                            
      padding: 80px 0 80px;                                                                   
  }                                                                                           
                                                                                              
  .map-wrapper {                                                                              
      display: grid;                                                                          
      grid-template-columns: 1fr 400px;                                                       
      gap: 0;                                                                                 
      border-radius: var(--radius-lg);                                                        
      overflow: hidden;                                                                       
      box-shadow: var(--shadow-lg);                                                           
  }                                                                                           
                                                                                              
  .map-container {                                                                            
      height: 400px;                                                                          
      background: var(--primary-light);                                                       
  }                                                                                           
                                                                                              
  .map-container iframe {                                                                     
      width: 100%;                                                                            
      height: 100%;                                                                           
      border: 0;                                                                              
  }                                                                                           
                                                                                              
  .map-info {                                                                                 
      background: var(--primary);                                                             
      color: white;                                                                           
      padding: 40px;                                                                          
      display: flex;                                                                          
      flex-direction: column;                                                                 
      justify-content: center;                                                                
  }                                                                                           
                                                                                              
  .map-info h3 {                                                                              
      font-size: 1.5rem;                                                                      
      font-weight: 700;                                                                       
      margin-bottom: 20px;                                                                    
  }                                                                                           
                                                                                              
  .map-info-item {                                                                            
      display: flex;                                                                          
      align-items: flex-start;                                                                
      gap: 14px;                                                                              
      margin-bottom: 20px;                                                                    
  }                                                                                           
                                                                                              
  .map-info-item svg {                                                                        
      width: 22px;                                                                            
      height: 22px;                                                                           
      fill: white;                                                                            
      flex-shrink: 0;                                                                         
      margin-top: 2px;                                                                        
  }                                                                                           
                                                                                              
  .map-info-item p {                                                                          
      font-size: 0.95rem;                                                                     
      line-height: 1.5;                                                                       
  }                                                                                           
                                                                                              
  .map-info-item a {                                                                          
      color: white;                                                                           
      text-decoration: none;                                                                  
  }                                                                                           
                                                                                              
  .map-info-item a:hover {                                                                    
      text-decoration: underline;                                                             
  }                                                                                           
                                                                                              
  .map-btn {                                                                                  
      display: inline-flex;                                                                   
      align-items: center;                                                                    
      justify-content: center;                                                                
      gap: 10px;                                                                              
      padding: 14px 28px;                                                                     
      background: white;                                                                      
      color: var(--primary);                                                                  
      font-weight: 600;                                                                       
      font-size: 0.95rem;                                                                     
      border-radius: 50px;                                                                    
      text-decoration: none;                                                                  
      margin-top: 20px;                                                                       
      transition: all 0.3s ease;                                                              
  }                                                                                           
                                                                                              
  .map-btn:hover {                                                                            
      background: var(--primary-light);                                                       
      transform: translateY(-2px);                                                            
  }                                                                                           
                                                                                              
  .map-btn svg {                                                                              
      width: 18px;                                                                            
      height: 18px;                                                                           
      fill: var(--primary);                                                                   
  }                                                                                           
                                                                                              
  /* Responsive */                                                                            
  @media (max-width: 1024px) {                                                                
      .map-wrapper { grid-template-columns: 1fr; }                                            
      .map-container { height: 300px; }                                                       
      .map-info { padding: 32px; }                                                            
  }                                                                                           
                                                                                              
  HTML:                                                                                       
                                                                                              
  <!-- MAP SECTION -->                                                                        
  <section class="map-section" id="localisation">                                             
      <div class="container">                                                                 
          <div class="map-wrapper">                                                           
              <div class="map-container">                                                     
                  <iframe src="YOUR_GOOGLE_MAPS_EMBED_URL" allowfullscreen="" loading="lazy"  
  referrerpolicy="no-referrer-when-downgrade"></iframe>                                       
              </div>                                                                          
              <div class="map-info">                                                          
                  <h3>Nous Trouver</h3>                                                       
                  <div class="map-info-item">                                                 
                      <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 
  13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12  
  2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>                                                          
                      <p>YOUR ADDRESS LINE 1<br>YOUR ADDRESS LINE 2</p>                       
                  </div>                                                                      
                  <div class="map-info-item">                                                 
                      <svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59  
  6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1
   1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57                 
  3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>                                                
                      <p><a href="tel:+212XXXXXXXXX">+212 XXX XXX XXX</a></p>                 
                  </div>                                                                      
                  <div class="map-info-item">                                                 
                      <svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10   
  9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 
  8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>                             
                      <p>Ouvert toute l'annee<br>Reservation recommandee</p>                  
                  </div>                                                                      
                  <a href="https://maps.google.com/?q=YOUR+LOCATION" target="_blank"          
  class="map-btn">                                                                            
                      <svg viewBox="0 0 24 24"><path d="M21.71                                
  11.29l-9-9c-.39-.39-1.02-.39-1.41 0l-9 9c-.39.39-.39 1.02 0 1.41l9 9c.39.39 1.02.39 1.41    
  0l9-9c.39-.38.39-1.01 0-1.41zM14 14.5V12h-4v3H8v-4c0-.55.45-1 1-1h5V7.5l3.5 3.5-3.5         
  3.5z"/></svg>                                                                               
                      Ouvrir dans Google Maps                                                 
                  </a>                                                                        
              </div>                                                                          
          </div>                                                                              
      </div>                                                                                  
  </section>                                                                                  
                                                                                              
  
CHANGES LOG:

2026-01-28: Removed the location itinerary text (e.g., "Marrakech → Ait Ben Haddou → Dades Gorges → ...")
            that was displayed below the "Travel Route" heading in the activity detail page.
            File: src/app/(frontend)/[locale]/activities/[slug]/activity-detail-client.tsx
            The map now shows just the title followed directly by the RouteMap component.
