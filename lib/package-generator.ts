import type { ProjectType, Profile } from '@/types/database';

export interface PackageGenerationInput {
  profile: Profile;
  projectType: ProjectType;
  clientType: 'startup' | 'smb' | 'enterprise';
  positioning: 'budget' | 'mid-market' | 'premium';
}

export interface GeneratedPackageData {
  package_name: 'Starter' | 'Standard' | 'Premium';
  price: number;
  short_description: string;
  includes_text: string;
}

/**
 * Generates 3 pricing packages (Starter, Standard, Premium) based on user inputs
 */
export function generatePackages(input: PackageGenerationInput): GeneratedPackageData[] {
  const { profile, projectType, clientType, positioning } = input;

  // Calculate base project hours
  // Complexity multiplier: 1 = 0.5x, 2 = 0.75x, 3 = 1x, 4 = 1.5x, 5 = 2x
  const complexityMultiplier = 0.5 + (projectType.complexity - 1) * 0.375;
  const baseHours = projectType.typical_duration_days * 8 * complexityMultiplier;

  // Client type multiplier
  const clientMultiplier = {
    startup: 0.8,
    smb: 1.0,
    enterprise: 1.3,
  }[clientType];

  // Positioning multiplier
  const positioningMultiplier = {
    budget: 0.7,
    'mid-market': 1.0,
    premium: 1.5,
  }[positioning];

  // Calculate base price
  const basePrice = baseHours * profile.base_hourly_rate * clientMultiplier * positioningMultiplier;

  // Generate packages
  const packages: GeneratedPackageData[] = [
    {
      package_name: 'Starter',
      price: Math.round(basePrice),
      short_description: `Essential ${projectType.name} package with core features`,
      includes_text: generateIncludesText(projectType, 'starter'),
    },
    {
      package_name: 'Standard',
      price: Math.round(basePrice * 1.6), // 1.6x multiplier for Standard
      short_description: `Complete ${projectType.name} solution with all essential features`,
      includes_text: generateIncludesText(projectType, 'standard'),
    },
    {
      package_name: 'Premium',
      price: Math.round(basePrice * 2.5), // 2.5x multiplier for Premium
      short_description: `Premium ${projectType.name} package with extended features and support`,
      includes_text: generateIncludesText(projectType, 'premium'),
    },
  ];

  return packages;
}

function generateIncludesText(projectType: ProjectType, tier: 'starter' | 'standard' | 'premium'): string {
  const baseItems: string[] = [];
  const standardItems: string[] = [];
  const premiumItems: string[] = [];

  // Generate items based on project type
  if (projectType.name.toLowerCase().includes('website') || projectType.name.toLowerCase().includes('web')) {
    baseItems.push('Responsive design');
    baseItems.push('Up to 5 pages');
    baseItems.push('Basic SEO setup');
    standardItems.push('Up to 10 pages');
    standardItems.push('Advanced SEO optimization');
    standardItems.push('Contact form integration');
    standardItems.push('Social media integration');
    premiumItems.push('Unlimited pages');
    premiumItems.push('Custom animations');
    premiumItems.push('E-commerce integration');
    premiumItems.push('Priority support');
    premiumItems.push('3 months of maintenance');
  } else if (projectType.name.toLowerCase().includes('brand')) {
    baseItems.push('Logo design');
    baseItems.push('Color palette');
    baseItems.push('Typography selection');
    standardItems.push('Brand guidelines document');
    standardItems.push('Business card design');
    standardItems.push('Social media templates');
    premiumItems.push('Full brand identity system');
    premiumItems.push('Stationery design');
    premiumItems.push('Brand video');
    premiumItems.push('Brand strategy consultation');
  } else if (projectType.name.toLowerCase().includes('copy')) {
    baseItems.push('Up to 5 pages of copy');
    baseItems.push('1 round of revisions');
    baseItems.push('SEO-optimized content');
    standardItems.push('Up to 10 pages of copy');
    standardItems.push('2 rounds of revisions');
    standardItems.push('Content strategy document');
    premiumItems.push('Unlimited pages');
    premiumItems.push('Unlimited revisions');
    premiumItems.push('Content calendar');
    premiumItems.push('A/B testing recommendations');
  } else if (projectType.name.toLowerCase().includes('seo')) {
    baseItems.push('SEO audit');
    baseItems.push('Keyword research');
    baseItems.push('Monthly reporting');
    standardItems.push('On-page optimization');
    standardItems.push('Content recommendations');
    standardItems.push('Link building strategy');
    premiumItems.push('Full SEO strategy');
    premiumItems.push('Content creation');
    premiumItems.push('Technical SEO fixes');
    premiumItems.push('Competitor analysis');
  } else {
    // Generic items
    baseItems.push('Core deliverables');
    baseItems.push('1 round of revisions');
    baseItems.push('Basic documentation');
    standardItems.push('Extended deliverables');
    standardItems.push('2 rounds of revisions');
    standardItems.push('Comprehensive documentation');
    premiumItems.push('Full scope deliverables');
    premiumItems.push('Unlimited revisions');
    premiumItems.push('Priority support');
    premiumItems.push('Extended warranty');
  }

  // Combine items based on tier
  let allItems: string[] = [];
  if (tier === 'starter') {
    allItems = baseItems;
  } else if (tier === 'standard') {
    allItems = [...baseItems, ...standardItems];
  } else {
    allItems = [...baseItems, ...standardItems, ...premiumItems];
  }

  return allItems.map(item => `• ${item}`).join('\n');
}



