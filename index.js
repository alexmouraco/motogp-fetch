const puppeteer = require('puppeteer');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/fetch-motogp', async (req, res) => {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Acessar página de login
        await page.goto('https://quintevents.my.site.com', { waitUntil: 'networkidle2' });
        await page.type('input[name="username"]', 'fernando.nunes@primeevent.global');
        await page.type('input[name="password"]', 'PrimeXP@2021');
        await page.click('input[type="submit"]');
        await page.waitForNavigation();

        // Acessar página de pacotes
        await page.goto('https://quintevents.my.site.com/formula1lightning/login?ec=302&inst=Pl&startURL=%2Fformula1lightning%2Fapex%2FQE_ProductInventoryCanvas%3Fsfdc.tabName%3D01r1Y000001QIYc', { waitUntil: 'networkidle2' });

        // Capturar dados
        const data = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('table tr'));
            return rows.map(row => {
                const cols = row.querySelectorAll('td');
                return {
                    package: cols[0]?.innerText || '',
                    availability: cols[1]?.innerText || ''
                };
            }).filter(item => item.package.includes('MotoGP 2025'));
        });

        await browser.close();

        res.json({ success: true, data }); // Retorna os dados coletados
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
