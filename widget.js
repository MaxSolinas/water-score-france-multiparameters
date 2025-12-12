(function() {
    // -----------------------------------------------------------
    // 1. CONFIGURATION
    // -----------------------------------------------------------
    const CONFIG = {
        containerId: 'kinetico-fr-widget-root',
        quoteLink: '/durete-de-leau-en-france#Obtenez-votre-devis',
        websiteLink: 'https://www.aquapurify.eu'
    };

    // -----------------------------------------------------------
    // 2. PARAMÉTRAGE (Dictionnaire)
    // -----------------------------------------------------------
    
    // LISTE DES CODES À RÉCUPÉRER
    // On garde la liste actuelle, on ajoutera les vôtres ensuite.
    const TARGET_PARAMS = [1345, 1340, 1302, 1313, 1149, 8578, 1749, 1382, 1388, 1476, 1117];

    // ORDRE D'AFFICHAGE DANS LA LISTE
    const DISPLAY_ORDER = [
        "1340", // Nitrates
        "1302", // pH
        "1313", // Chlore
        "1149", // E. Coli
        "8578", // Total PFAS
        "1749", // Total Pesticides
        "1382", // Plomb
        "1388", // Uranium
        "1476", // CVM
        "1117"  // Benzène
    ];

    // DÉFINITIONS, UNITÉS ET SEUILS
    const PARAMS_MAP = {
        "1345": { label: "Dureté", unit: "°f" }, 
        "1340": { label: "Nitrates", unit: "mg/L", limit: 50 },
        "1302": { label: "pH", unit: "", min: 6.5, max: 9.0 },
        "1313": { label: "Chlore libre", unit: "mg/L", limit: 10 }, 
        "1149": { label: "Bactéries E. Coli", unit: "n/100mL", limit: 0 },
        "8578": { label: "PFAS (Total 20)", unit: "µg/L", limit: 0.10 },
        "1749": { label: "Pesticides (Total)", unit: "µg/L", limit: 0.50 },
        "1382": { label: "Plomb", unit: "µg/L", limit: 10 },
        "1388": { label: "Uranium", unit: "µg/L", limit: 30 },
        "1476": { label: "CVM (Vinyle)", unit: "µg/L", limit: 0.5 },
        "1117": { label: "Benzène", unit: "µg/L", limit: 1.0 }
    };

    // -----------------------------------------------------------
    // 3. CSS (DESIGN & ANIMATIONS)
    // -----------------------------------------------------------
    const css = `
        #kinetico-fr-widget-container { font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 30px auto; background: #fff; border: 1px solid #e1e4e8; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: visible; text-align: center; position: relative; padding-bottom: 25px; }
        .kw-fr-header { padding: 30px 20px 10px; border-radius: 12px 12px 0 0; }
        .kw-fr-headline { text-transform: uppercase; line-height: 1.1; color: #00ADEF; font-size: 2.4rem; margin: 0; }
        .kw-fr-top-line { font-family: 'Arial Black', sans-serif; font-weight: 900; display: block; letter-spacing: -1px; }
        .kw-fr-second-line { display: block; color: #0054A4; }
        .kw-fr-word-water { font-weight: 300; font-family: 'Segoe UI', sans-serif; } .kw-fr-word-score { font-family: 'Arial Black', sans-serif; font-weight: 900; letter-spacing: -1px; }
        .kw-fr-tm { font-size: 0.3em; vertical-align: top; position: relative; top: 0.1em; font-weight: 400; margin-left: 2px; line-height: 1; font-family: Arial, sans-serif; }
        .kw-fr-subtext { color: #666; margin-top: 10px; font-size: 0.95rem; }
        
        .kw-fr-search-area { padding: 0 30px 15px; position: relative; }
        .kw-fr-input { width: 100%; padding: 15px; border: 2px solid #ddd; border-radius: 50px; font-size: 16px; outline: none; text-align: center; transition: 0.3s; box-sizing: border-box; }
        .kw-fr-input:focus { border-color: #0054A4; box-shadow: 0 0 0 3px rgba(0, 84, 164, 0.1); }
        .kw-fr-suggestions { position: absolute; top: 65px; left: 30px; right: 30px; background: white; border: 1px solid #cce4f7; z-index: 9999; max-height: 250px; overflow-y: auto; box-shadow: 0 15px 30px rgba(0,0,0,0.15); display: none; border-radius: 8px; }
        .kw-fr-suggestion-item { padding: 12px 15px; cursor: pointer; border-bottom: 1px solid #f0f0f0; text-align: left; }
        .kw-fr-suggestion-item:hover { background: #f0f7ff; color: #0054A4; }

        /* LOADER (ROUE ANIMÉE) */
        .kw-fr-loader-container { display: none; margin: 20px auto; text-align: center; }
        .kw-fr-spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #00ADEF;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: kw-spin 1s linear infinite;
            margin: 0 auto 10px;
        }
        .kw-fr-loader-text { color: #888; font-style: italic; font-size: 0.9em; }
        @keyframes kw-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        /* SLIDER */
        .kw-fr-slider-wrapper { padding: 0 20px; transition: opacity 0.3s; margin-top: 10px; }
        .kw-fr-slider-container { position: relative; height: 60px; margin: 20px 10px; }
        .kw-fr-slider-bar { height: 40px; width: 100%; border-radius: 4px; background: linear-gradient(90deg, #F57F20 0%, #E5007E 50%, #00ADEF 100%); position: relative; top: 10px; }
        .kw-fr-grid-lines { position: absolute; top: 10px; left: 0; width: 100%; height: 40px; display: flex; justify-content: space-between; pointer-events: none; }
        .kw-fr-line { width: 1px; background: rgba(255,255,255,0.4); height: 100%; }
        .kw-fr-water-drop { position: absolute; top: -15px; transform: translateX(-50%); width: 50px; height: 65px; transition: left 1.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s; z-index: 10; filter: drop-shadow(0 3px 5px rgba(0,0,0,0.2)); }
        .kw-fr-drop-shape { width: 42px; height: 42px; background: #00ADEF; border-radius: 0 50% 50% 50%; transform: rotate(45deg); margin: 0 auto; border: 3px solid white; transition: background 1.5s; }
        .kw-fr-drop-value { position: absolute; top: 13px; left: 0; width: 100%; text-align: center; color: white; font-weight: 800; font-size: 15px; text-shadow: 0 1px 2px rgba(0,0,0,0.2); }
        .kw-fr-labels { display: flex; justify-content: space-between; margin-top: 15px; color: #999; font-size: 11px; font-weight: bold; padding: 0 2px; }

        .kw-fr-result-panel { padding: 0 20px 10px; animation: kw-fadein 0.6s ease-out; }
        .kw-fr-commune-title { font-size: 1.3rem; font-weight: bold; color: #0054A4; margin-top: 10px; }
        .kw-fr-message-box { background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 25px; border: 1px solid #eee; }
        
        /* TABLEAU DÉTAILS */
        .kw-fr-details-container { margin-top: 25px; border-top: 1px solid #e1e4e8; padding-top: 15px; text-align: left; }
        .kw-fr-details-header { font-size: 0.85rem; color: #888; text-transform: uppercase; font-weight: bold; margin-bottom: 10px; letter-spacing: 0.5px; }
        
        .kw-fr-detail-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px dashed #e0e0e0; font-size: 0.95rem; }
        .kw-fr-detail-row:last-child { border-bottom: none; }
        
        .kw-fr-detail-label { display: flex; align-items: center; color: #444; font-weight: 500; }
        .kw-fr-detail-value { font-weight: 700; color: #333; font-family: 'Arial', sans-serif; text-align: right; }
        .kw-fr-detail-na { color: #999; font-style: italic; font-weight: 400; font-size: 0.85em; }
        
        .kw-fr-dot { width: 10px; height: 10px; border-radius: 50%; margin-right: 10px; display: inline-block; flex-shrink: 0; }
        .kw-dot-green { background-color: #4CAF50; }
        .kw-dot-orange { background-color: #FF9800; }
        .kw-dot-red { background-color: #F44336; }
        .kw-dot-grey { background-color: #e0e0e0; }

        .kw-fr-cta-button { display: none; margin-top: 20px; background: #0054A4; color: white; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: bold; transition: 0.3s; text-transform: uppercase; letter-spacing: 0.5px; display: block; text-align: center; }
        .kw-fr-cta-button:hover { background: #003d7a; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,84,164,0.3); }
        .kw-fr-footer-block { margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; margin-left: 30px; margin-right: 30px; }
        .kw-fr-dealer-info { font-size: 11px; color: #555; }
        .kw-fr-dealer-link { color: #555; text-decoration: none; transition: color 0.2s; }
        .kw-fr-dealer-link:hover { color: #000; }
        .kw-fr-source-data { font-size: 9px; color: #aaa; margin-top: 10px; display: block; }
        .kw-fr-error-msg { color: #d32f2f; display: none; margin: 10px; font-weight: bold; background:#ffebee; padding:10px; border-radius:5px;}
        @keyframes kw-fadein { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    `;

    // -----------------------------------------------------------
    // 4. HTML
    // -----------------------------------------------------------
    const htmlTemplate = `
        <div id="kinetico-fr-widget-container">
            <div class="kw-fr-header">
                <h2 class="kw-fr-headline">
                    <span class="kw-fr-top-line">WHAT'S YOUR</span>
                    <span class="kw-fr-second-line">
                        <span class="kw-fr-word-water">WATER</span> <span class="kw-fr-word-score">SCORE?<sup class="kw-fr-tm">TM</sup></span>
                    </span>
                </h2>
                <div class="kw-fr-subtext">Découvrez la qualité complète de votre eau (Calcaire, Nitrates, PFAS...).</div>
            </div>
            
            <div class="kw-fr-search-area">
                <input type="text" id="kw-input-fr" class="kw-fr-input" placeholder="Ex: Paris, Lyon..." autocomplete="off">
                <div id="kw-suggestions-fr" class="kw-fr-suggestions"></div>
                
                <div id="kw-loader-fr" class="kw-fr-loader-container">
                    <div class="kw-fr-spinner"></div>
                    <div class="kw-fr-loader-text">Analyse de l'historique en cours...</div>
                </div>

                <div id="kw-error-fr" class="kw-fr-error-msg"></div>
            </div>

            <div class="kw-fr-slider-wrapper">
                <div class="kw-fr-slider-container">
                    <div class="kw-fr-slider-bar">
                        <div class="kw-fr-grid-lines">
                             <div class="kw-fr-line"></div><div class="kw-fr-line"></div><div class="kw-fr-line"></div>
                             <div class="kw-fr-line"></div><div class="kw-fr-line"></div><div class="kw-fr-line"></div>
                             <div class="kw-fr-line"></div><div class="kw-fr-line"></div>
                        </div>
                    </div>
                    <div id="kw-drop-fr" class="kw-fr-water-drop" style="opacity: 0;">
                        <div id="kw-drop-shape-fr" class="kw-fr-drop-shape"></div>
                        <div id="kw-score-val-fr" class="kw-fr-drop-value">--</div>
                    </div>
                    <div class="kw-fr-labels">
                        <span>30</span><span>40</span><span>50</span><span>60</span><span>70</span><span>80</span><span>90</span><span>100</span>
                    </div>
                </div>
            </div>

            <div id="kw-result-fr" class="kw-fr-result-panel" style="display:none;">
                <div id="kw-commune-display-fr" class="kw-fr-commune-title"></div>
                
                <div class="kw-fr-message-box">
                    <strong id="kw-verdict-title-fr" style="font-size: 1.2em; display:block; margin-bottom:8px;"></strong>
                    <div id="kw-verdict-desc-fr" style="font-size: 0.95em; color:#555; margin:0; line-height: 1.5;"></div>

                    <div id="kw-details-container-fr" class="kw-fr-details-container">
                        <div class="kw-fr-details-header">Dernières valeurs connues (Historique)</div>
                        <div id="kw-details-list-fr"></div>
                    </div>

                    <a href="${CONFIG.quoteLink}" id="kw-cta-btn-fr" class="kw-fr-cta-button">AMÉLIOREZ VOTRE EAU</a>
                </div>
            </div>

            <div class="kw-fr-footer-block">
                <div class="kw-fr-dealer-info">
                    <a href="${CONFIG.websiteLink}" target="_blank" class="kw-fr-dealer-link">Aqua Purify</a><br>
                    Authorized, Independent Kinetico Dealer
                </div>
                <span class="kw-fr-source-data">Données : Ministère de la Santé / Hub'Eau (API Temps Réel)</span>
            </div>
        </div>
    `;

    // -----------------------------------------------------------
    // 5. LOGIQUE JAVASCRIPT
    // -----------------------------------------------------------
    function initWidget() {
        const root = document.getElementById(CONFIG.containerId);
        if (!root) return;

        const styleTag = document.createElement('style');
        styleTag.textContent = css;
        document.head.appendChild(styleTag);
        root.innerHTML = htmlTemplate;

        // DOM
        const input = document.getElementById('kw-input-fr');
        const suggestions = document.getElementById('kw-suggestions-fr');
        const loader = document.getElementById('kw-loader-fr');
        const errorMsg = document.getElementById('kw-error-fr');
        const resultPanel = document.getElementById('kw-result-fr');
        const displayCommune = document.getElementById('kw-commune-display-fr');
        const drop = document.getElementById('kw-drop-fr');
        const scoreVal = document.getElementById('kw-score-val-fr');
        const verdictTitle = document.getElementById('kw-verdict-title-fr');
        const verdictDesc = document.getElementById('kw-verdict-desc-fr');
        const dropShape = document.getElementById('kw-drop-shape-fr');
        const detailsList = document.getElementById('kw-details-list-fr');

        let debounceTimer;

        input.addEventListener('input', (e) => {
            const val = e.target.value;
            clearTimeout(debounceTimer);
            if(val.length < 2) { 
                suggestions.style.display = 'none'; 
                if(val.length === 0) { drop.style.opacity = '0'; resultPanel.style.display = 'none'; }
                return; 
            }
            debounceTimer = setTimeout(async () => {
                try {
                    const req = await fetch(`https://geo.api.gouv.fr/communes?nom=${val}&fields=nom,code,codesPostaux&boost=population&limit=6`);
                    const data = await req.json();
                    renderSuggestions(data);
                } catch(e) { console.error(e); }
            }, 300);
        });

        function renderSuggestions(list) {
            suggestions.innerHTML = '';
            if(!list.length) { suggestions.style.display = 'none'; return; }
            list.forEach(c => {
                const div = document.createElement('div');
                div.className = 'kw-fr-suggestion-item';
                const cp = c.codesPostaux ? c.codesPostaux[0] : c.code;
                div.textContent = `${c.nom} (${cp})`;
                div.onclick = () => {
                    input.value = c.nom;
                    suggestions.style.display = 'none';
                    startAnalysis(c.code, c.nom);
                };
                suggestions.appendChild(div);
            });
            suggestions.style.display = 'block';
        }

        async function startAnalysis(insee, name) {
            loader.style.display = 'block';
            resultPanel.style.display = 'none';
            errorMsg.style.display = 'none';
            drop.style.opacity = '0';
            
            try {
                // 1. On cherche le TH sur la commune pour identifier le réseau
                // On charge une première louche de données
                let dataList = await fetchHubEauData(insee, 'commune');
                
                // Si pas de TH trouvé, on cherche les réseaux UDI
                const thCheck = dataList.find(d => d.code_parametre == 1345);
                
                if (!thCheck) {
                    const udiList = await getAllUDIsFromCommune(insee);
                    if (udiList && udiList.length > 0) {
                        for (const udi of udiList) {
                            dataList = await fetchHubEauData(udi, 'reseau');
                            // Si on trouve du TH sur ce réseau, on considère que c'est le bon
                            if (dataList.find(d => d.code_parametre == 1345)) break; 
                        }
                    }
                }

                loader.style.display = 'none';
                
                const finalTh = dataList.find(d => d.code_parametre == 1345);
                if (finalTh) {
                    updateUI(finalTh.resultat_numerique, dataList, name);
                } else {
                    errorMsg.innerHTML = "Pas de données d'analyse récentes pour <strong>" + name + "</strong>.";
                    errorMsg.style.display = 'block';
                }

            } catch (e) {
                console.error(e);
                loader.style.display = 'none';
                errorMsg.textContent = "Erreur de connexion au service Hub'Eau.";
                errorMsg.style.display = 'block';
            }
        }

        async function fetchHubEauData(code, type) {
            const codesStr = TARGET_PARAMS.join(',');
            // --- MODIFICATION CLÉ ---
            // On demande size=300 pour remonter loin dans l'historique (plusieurs années)
            // L'API renvoie du plus récent au plus ancien (sort=desc par défaut)
            let url = `https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable/resultats_dis?code_parametre=${codesStr}&sort=desc&size=300`;
            if (type === 'commune') url += `&code_commune=${code}`; else url += `&code_reseau=${code}`;
            
            const req = await fetch(url);
            const res = await req.json();
            return res.data || [];
        }

        async function getAllUDIsFromCommune(insee) {
            const url = `https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable/communes_udi?code_commune=${insee}`;
            const req = await fetch(url);
            const res = await req.json();
            if (res.data && res.data.length > 0) return res.data.map(item => item.code_reseau);
            return [];
        }

        function updateUI(thValue, fullData, cityName) {
            // -------------------------
            // 1. SCORE PRINCIPAL (TH)
            // -------------------------
            const th = parseFloat(thValue);
            let score;
            if (th < 5) score = 100 - (th * 2); 
            else if (th < 15) score = 96 - (th * 1.4); 
            else if (th < 30) score = 98 - (th * 1.6);
            else score = 49 - ((th - 30) * 0.4); 
            score = Math.max(30, Math.min(100, Math.round(score)));

            const reference = 12;
            const ratio = (th / reference).toFixed(1).replace('.0', '');
            let color, title, text;
            
            if (th < 12) {
                color = '#00ADEF'; title = "EAU DOUCE (OK)"; text = `Votre eau (${th.toFixed(1)}°f) respecte le seuil de confort.<br>Aucun traitement calcaire nécessaire.`; 
            } else if (th < 15) {
                color = '#00ADEF'; title = "EAU PEU CALCAIRE"; text = `Votre eau (${th.toFixed(1)}°f) est légèrement au-dessus du confort (12°f).`; 
            } else if (th < 30) {
                color = '#E5007E'; title = "ADOUCISSEUR RECOMMANDÉ"; text = `Votre eau est calcaire (${th.toFixed(1)}°f), soit <strong>${ratio} fois</strong> la référence (12°f).`; 
            } else {
                color = '#F57F20'; title = "ADOUCISSEUR INDISPENSABLE"; text = `Votre eau est très dure (${th.toFixed(1)}°f), soit <strong>${ratio} fois</strong> la référence (12°f).`; 
            }

            displayCommune.textContent = "Qualité de l'eau à " + cityName;
            verdictTitle.textContent = title;
            verdictTitle.style.color = color;
            verdictDesc.innerHTML = text;
            scoreVal.textContent = score;
            dropShape.style.background = color;
            dropShape.style.borderColor = "white";
            
            drop.style.opacity = '1';
            const percent = ((score - 30) / 70) * 100;
            drop.style.left = `${percent}%`;
            resultPanel.style.display = 'block';

            // -------------------------
            // 2. LISTE DÉTAILS AVEC HISTORIQUE
            // -------------------------
            detailsList.innerHTML = '';
            
            DISPLAY_ORDER.forEach(code => {
                const def = PARAMS_MAP[code];
                
                // --- LOGIQUE HISTORIQUE ---
                // fullData contient 300 résultats triés par date (le plus récent en premier).
                // .find() va s'arrêter dès qu'il trouve la PREMIÈRE occurrence du code.
                // Donc on récupère bien la valeur la plus récente disponible dans l'historique.
                const item = fullData.find(d => d.code_parametre == code);
                
                let valHtml = '';
                let dotClass = 'kw-dot-grey';
                
                if (!item) {
                    valHtml = `<span class="kw-fr-detail-na">Non analysé récemment</span>`;
                    dotClass = 'kw-dot-grey';
                } else {
                    const val = parseFloat(item.resultat_numerique);
                    valHtml = `${val} <small>${def.unit}</small>`;
                    
                    dotClass = 'kw-dot-green'; 
                    
                    if (def.limit !== undefined) {
                        if (val > def.limit) dotClass = 'kw-dot-red';
                        else if ((code == '8578' || code == '1749') && val > (def.limit / 2)) dotClass = 'kw-dot-orange';
                    }
                    if (def.min !== undefined && def.max !== undefined) {
                        if (val < def.min || val > def.max) dotClass = 'kw-dot-orange';
                    }
                }

                const row = document.createElement('div');
                row.className = 'kw-fr-detail-row';
                row.innerHTML = `
                    <div class="kw-fr-detail-label">
                        <span class="kw-fr-dot ${dotClass}"></span>
                        ${def.label}
                    </div>
                    <div class="kw-fr-detail-value">${valHtml}</div>
                `;
                detailsList.appendChild(row);
            });
        }

        document.addEventListener('click', (e) => {
            if(input && suggestions && !input.contains(e.target) && !suggestions.contains(e.target)) {
                suggestions.style.display = 'none';
            }
        });
    }

    let attempts = 0;
    const interval = setInterval(function() {
        const root = document.getElementById(CONFIG.containerId);
        if (root) {
            clearInterval(interval);
            initWidget();
        }
        attempts++;
        if (attempts > 30) clearInterval(interval);
    }, 300);

})();
