#!/usr/bin/env node
/**
 * UI Design Vector Experiment
 * 
 * Experiment: Dashboard as extension of Supabase vector data
 * Uses modern UI design scraping to compare and create designs
 * based on aesthetic comparison of factors
 * 
 * Flow:
 * 1. Scrape modern UI designs from web
 * 2. Convert to vector embeddings
 * 3. Store in Supabase
 * 4. Compare with existing dashboard designs
 * 5. Generate new designs based on aesthetic similarity
 * 
 * Usage:
 *   node scripts/experiments/ui-design-vector-experiment.js
 */

const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
const { loadSupabaseCredentials } = require('../utils/secure-credential-loader');
const { getCredential } = require('../utils/secure-credential-loader');
const fs = require('fs');
const path = require('path');

class UIDesignVectorExperiment {
  constructor() {
    this.supabase = null;
    this.browser = null;
    this.designSources = [
      'https://dribbble.com',
      'https://www.behance.net',
      'https://www.awwwards.com',
      'https://land-book.com',
      'https://www.siteinspire.com'
    ];
    this.aestheticFactors = [
      'color_palette',
      'typography',
      'spacing',
      'layout_structure',
      'visual_hierarchy',
      'interaction_patterns',
      'component_style',
      'overall_mood'
    ];
  }

  /**
   * Initialize experiment
   */
  async initialize() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎨 UI Design Vector Experiment');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Initialize Supabase
    try {
      const creds = loadSupabaseCredentials();
      this.supabase = createClient(creds.url, creds.serviceKey);
      console.log('✅ Supabase client initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Supabase:', error.message);
      throw error;
    }

    // Initialize browser
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('✅ Browser initialized\n');
  }

  /**
   * Scrape modern UI designs from web
   */
  async scrapeUIDesigns(sourceUrl, limit = 10) {
    console.log(`📸 Scraping UI designs from: ${sourceUrl}\n`);

    const page = await this.browser.newPage();
    const designs = [];

    try {
      await page.goto(sourceUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for content to load
      await page.waitForTimeout(3000);

      // Extract design information
      // This is a generic scraper - customize per site
      const designData = await page.evaluate(() => {
        const designs = [];
        
        // Find design cards/images
        const designElements = document.querySelectorAll('img[src*="design"], img[src*="ui"], .design-card, .project-card');
        
        designElements.forEach((el, index) => {
          if (index < 10) { // Limit to 10 designs
            const img = el.tagName === 'IMG' ? el : el.querySelector('img');
            if (img && img.src) {
              designs.push({
                imageUrl: img.src,
                title: el.getAttribute('alt') || el.getAttribute('title') || `Design ${index + 1}`,
                description: el.getAttribute('data-description') || '',
                source: window.location.hostname
              });
            }
          }
        });

        return designs;
      });

      designs.push(...designData);
      console.log(`   ✅ Scraped ${designData.length} designs from ${sourceUrl}`);

    } catch (error) {
      console.warn(`   ⚠️  Error scraping ${sourceUrl}: ${error.message}`);
    } finally {
      await page.close();
    }

    return designs;
  }

  /**
   * Analyze design aesthetics
   */
  async analyzeDesignAesthetics(design) {
    console.log(`   🎨 Analyzing aesthetics for: ${design.title}`);

    const page = await this.browser.newPage();
    const analysis = {
      color_palette: [],
      typography: {},
      spacing: {},
      layout_structure: '',
      visual_hierarchy: {},
      interaction_patterns: [],
      component_style: '',
      overall_mood: ''
    };

    try {
      // Load design image
      if (design.imageUrl) {
        await page.goto(design.imageUrl, {
          waitUntil: 'networkidle2',
          timeout: 10000
        }).catch(() => {
          // If direct image load fails, try embedding in HTML
          const html = `
            <html>
              <body style="margin:0;padding:0;">
                <img src="${design.imageUrl}" style="max-width:100%;height:auto;" />
              </body>
            </html>
          `;
          return page.setContent(html);
        });

        // Extract color palette (simplified - would use image processing in production)
        const colors = await page.evaluate(() => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = document.querySelector('img');
          
          if (!img) return [];
          
          canvas.width = img.width || 100;
          canvas.height = img.height || 100;
          ctx.drawImage(img, 0, 0);
          
          // Sample colors from image
          const colorData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          const colors = [];
          const colorMap = {};
          
          // Sample every 100th pixel
          for (let i = 0; i < colorData.length; i += 400) {
            const r = colorData[i];
            const g = colorData[i + 1];
            const b = colorData[i + 2];
            const hex = `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
            
            if (!colorMap[hex]) {
              colorMap[hex] = 0;
            }
            colorMap[hex]++;
          }
          
          // Get top 5 colors
          return Object.entries(colorMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([color]) => color);
        });

        analysis.color_palette = colors;
        analysis.overall_mood = this.determineMood(colors);
      }
    } catch (error) {
      console.warn(`   ⚠️  Error analyzing design: ${error.message}`);
    } finally {
      await page.close();
    }

    return analysis;
  }

  /**
   * Determine mood from colors
   */
  determineMood(colors) {
    if (!colors || colors.length === 0) return 'neutral';
    
    // Simple mood detection based on color analysis
    const colorStrings = colors.join(' ');
    const darkColors = colorStrings.match(/#[0-9a-f]{2}[0-9a-f]{4}/gi) || [];
    const brightColors = colorStrings.match(/#[fF][0-9a-f]{5}/gi) || [];
    
    if (darkColors.length > brightColors.length) {
      return 'dark';
    } else if (brightColors.length > darkColors.length) {
      return 'bright';
    } else {
      return 'balanced';
    }
  }

  /**
   * Generate vector embedding from design analysis
   */
  async generateDesignEmbedding(design, analysis) {
    console.log(`   🔢 Generating vector embedding for: ${design.title}`);

    // Create text representation of design
    const designText = `
      Design: ${design.title}
      Description: ${design.description}
      Colors: ${analysis.color_palette.join(', ')}
      Mood: ${analysis.overall_mood}
      Layout: ${analysis.layout_structure}
      Style: ${analysis.component_style}
    `.trim();

    // Generate embedding using OpenRouter
    try {
      const openRouterApiKey = getCredential('OPENROUTER_API_KEY');
      if (!openRouterApiKey) {
        throw new Error('OPENROUTER_API_KEY not found');
      }

      const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'HTTP-Referer': 'https://alex-ai-universal.com',
          'X-Title': 'Alex AI Universal',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small', // or 'text-embedding-ada-002'
          input: designText
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.warn(`   ⚠️  Error generating embedding: ${error.message}`);
      // Fallback: create simple vector from design features
      return this.createFallbackEmbedding(design, analysis);
    }
  }

  /**
   * Create fallback embedding from design features
   */
  createFallbackEmbedding(design, analysis) {
    // Create a simple feature vector
    const vector = new Array(1536).fill(0);
    
    // Encode color palette
    analysis.color_palette.forEach((color, i) => {
      const rgb = this.hexToRgb(color);
      if (rgb) {
        vector[i * 3] = rgb.r / 255;
        vector[i * 3 + 1] = rgb.g / 255;
        vector[i * 3 + 2] = rgb.b / 255;
      }
    });

    // Encode mood
    const moodMap = { dark: 0.2, bright: 0.8, balanced: 0.5, neutral: 0.5 };
    vector[100] = moodMap[analysis.overall_mood] || 0.5;

    return vector;
  }

  /**
   * Convert hex to RGB
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Store design in Supabase
   */
  async storeDesignInSupabase(design, analysis, embedding) {
    console.log(`   💾 Storing design in Supabase: ${design.title}`);

    try {
      const { data, error } = await this.supabase
        .from('vector_embeddings')
        .insert({
          embedding: embedding,
          metadata: {
            type: 'ui_design',
            title: design.title,
            description: design.description,
            imageUrl: design.imageUrl,
            source: design.source,
            aesthetic_analysis: analysis,
            scraped_at: new Date().toISOString()
          },
          pattern_type: 'ui_design',
          crew_member: 'system',
          confidence_score: 0.8
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`   ✅ Design stored with ID: ${data.id}`);
      return data;
    } catch (error) {
      console.error(`   ❌ Error storing design: ${error.message}`);
      throw error;
    }
  }

  /**
   * Compare designs with existing dashboard
   */
  async compareWithDashboard(designEmbedding) {
    console.log('   🔍 Comparing with existing dashboard designs...\n');

    try {
      // Get existing dashboard designs from vector_embeddings
      const { data: dashboardDesigns, error } = await this.supabase
        .from('vector_embeddings')
        .select('id, embedding, metadata')
        .eq('pattern_type', 'dashboard')
        .limit(10);

      if (error) throw error;

      if (!dashboardDesigns || dashboardDesigns.length === 0) {
        console.log('   ⚠️  No existing dashboard designs found for comparison');
        return [];
      }

      // Calculate similarity scores
      const comparisons = dashboardDesigns.map(dashboard => {
        const similarity = this.calculateCosineSimilarity(
          designEmbedding,
          dashboard.embedding
        );

        return {
          dashboardId: dashboard.id,
          similarity: similarity,
          metadata: dashboard.metadata
        };
      }).sort((a, b) => b.similarity - a.similarity);

      console.log(`   ✅ Found ${comparisons.length} dashboard designs for comparison`);
      return comparisons;
    } catch (error) {
      console.error(`   ❌ Error comparing designs: ${error.message}`);
      return [];
    }
  }

  /**
   * Calculate cosine similarity
   */
  calculateCosineSimilarity(vec1, vec2) {
    if (!vec1 || !vec2 || vec1.length !== vec2.length) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Generate new design based on aesthetic similarity
   */
  async generateDesignFromSimilarity(scrapedDesign, similarDashboard, similarity) {
    console.log(`   🎨 Generating new design based on similarity: ${similarity.toFixed(3)}\n`);

    const newDesign = {
      title: `Hybrid: ${scrapedDesign.title} + Dashboard`,
      description: `Design generated from aesthetic comparison between scraped design and existing dashboard`,
      aesthetic_factors: {
        color_palette: this.blendColorPalettes(
          scrapedDesign.metadata?.aesthetic_analysis?.color_palette || [],
          similarDashboard.metadata?.aesthetic_analysis?.color_palette || []
        ),
        mood: this.blendMoods(
          scrapedDesign.metadata?.aesthetic_analysis?.overall_mood,
          similarDashboard.metadata?.aesthetic_analysis?.overall_mood
        ),
        similarity_score: similarity
      },
      source_designs: {
        scraped: scrapedDesign.id,
        dashboard: similarDashboard.dashboardId
      }
    };

    return newDesign;
  }

  /**
   * Blend color palettes
   */
  blendColorPalettes(palette1, palette2) {
    // Simple blending - take colors from both palettes
    const combined = [...palette1, ...palette2];
    // Remove duplicates and limit to 5
    return [...new Set(combined)].slice(0, 5);
  }

  /**
   * Blend moods
   */
  blendMoods(mood1, mood2) {
    const moods = [mood1, mood2].filter(Boolean);
    if (moods.length === 0) return 'neutral';
    if (moods.length === 1) return moods[0];
    
    // If moods are different, return 'balanced'
    if (moods[0] !== moods[1]) return 'balanced';
    return moods[0];
  }

  /**
   * Run complete experiment
   */
  async runExperiment() {
    try {
      // Step 1: Scrape UI designs
      console.log('📸 Step 1: Scraping Modern UI Designs\n');
      const allDesigns = [];
      
      for (const source of this.designSources.slice(0, 2)) { // Limit to 2 sources for testing
        const designs = await this.scrapeUIDesigns(source, 5);
        allDesigns.push(...designs);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limiting
      }

      console.log(`\n✅ Scraped ${allDesigns.length} total designs\n`);

      // Step 2: Analyze and store designs
      console.log('🎨 Step 2: Analyzing Designs and Generating Embeddings\n');
      const storedDesigns = [];

      for (const design of allDesigns.slice(0, 5)) { // Limit to 5 for testing
        try {
          const analysis = await this.analyzeDesignAesthetics(design);
          const embedding = await this.generateDesignEmbedding(design, analysis);
          const stored = await this.storeDesignInSupabase(design, analysis, embedding);
          storedDesigns.push(stored);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
        } catch (error) {
          console.warn(`   ⚠️  Skipping design due to error: ${error.message}`);
        }
      }

      console.log(`\n✅ Stored ${storedDesigns.length} designs in Supabase\n`);

      // Step 3: Compare with dashboard
      console.log('🔍 Step 3: Comparing with Dashboard Designs\n');
      const comparisons = [];

      for (const design of storedDesigns) {
        const similar = await this.compareWithDashboard(design.embedding);
        if (similar.length > 0) {
          comparisons.push({
            design: design,
            similarDashboards: similar
          });
        }
      }

      console.log(`\n✅ Found ${comparisons.length} designs with similar dashboards\n`);

      // Step 4: Generate new designs
      console.log('🎨 Step 4: Generating New Designs from Similarity\n');
      const generatedDesigns = [];

      for (const comparison of comparisons) {
        const topMatch = comparison.similarDashboards[0];
        if (topMatch.similarity > 0.7) { // Threshold for similarity
          const newDesign = await this.generateDesignFromSimilarity(
            comparison.design,
            topMatch,
            topMatch.similarity
          );
          generatedDesigns.push(newDesign);
          console.log(`   ✅ Generated: ${newDesign.title}`);
        }
      }

      console.log(`\n✅ Generated ${generatedDesigns.length} new designs\n`);

      // Save results
      const resultsPath = path.join(__dirname, '../../reports/ui-design-experiment-results.json');
      fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
      fs.writeFileSync(resultsPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        scrapedDesigns: allDesigns.length,
        storedDesigns: storedDesigns.length,
        comparisons: comparisons.length,
        generatedDesigns: generatedDesigns
      }, null, 2));

      console.log(`📄 Results saved to: ${resultsPath}\n`);

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ EXPERIMENT COMPLETE');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
      console.error('\n❌ Experiment failed:', error);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Run experiment
if (require.main === module) {
  const experiment = new UIDesignVectorExperiment();
  experiment.runExperiment().catch(error => {
    console.error('❌ Experiment failed:', error);
    process.exit(1);
  });
}

module.exports = { UIDesignVectorExperiment };

