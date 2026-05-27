import heroimage1 from './assets/heroimage1.jpeg';
import heroimage2 from './assets/heroimage2.jpeg';
import heroimage3 from './assets/heroimage3.jpeg';

export const defaultProjectCategory = 'residential';

export const projectCategories = [
  {
    slug: 'residential',
    name: 'Residential',
    headline: 'Residential Projects',
    quote:
      '"You can’t really say what is beautiful about a place, but the image of the place will remain vividly with you."',
    quoteAuthor: 'Tadao Ando',
    description:
      'Ideora Design Studio creates residential interiors with warmth, function, and a refined visual identity. Every home is shaped to feel personal, balanced, and deeply connected to the people living in it.',
    coverImage: heroimage3,
    projects: [
      { title: 'Westhills', image: heroimage3 },
      { title: 'Ashutosh', image: heroimage2 },
      { title: 'Maa', image: heroimage1 },
      { title: 'Aarav', image: heroimage2 },
      { title: 'Nirvaan', image: heroimage1 },
      { title: 'The Courtyard', image: heroimage3 }
    ]
  },
  {
    slug: 'commercial',
    name: 'Commercial',
    headline: 'Commercial Projects',
    quote:
      '"Architecture should speak of its time and place, but yearn for timelessness."',
    quoteAuthor: 'Frank Gehry',
    description:
      'From offices to hospitality spaces, our commercial work is built around clarity, identity, and experience. We design environments that support business goals while leaving a lasting visual impression.',
    coverImage: heroimage2,
    projects: [
      { title: 'The Lobby House', image: heroimage2 },
      { title: 'Studio Grid', image: heroimage1 },
      { title: 'Urban Meet', image: heroimage3 },
      { title: 'The Workshop', image: heroimage1 },
      { title: 'Axis Office', image: heroimage2 },
      { title: 'Public Room', image: heroimage3 }
    ]
  },
  {
    slug: 'details',
    name: 'Details',
    headline: 'Project Details',
    quote:
      '"Beauty perishes in life, but is immortal in art."',
    quoteAuthor: 'Leonardo da Vinci',
    description:
      'The smallest layers of a project carry the strongest character. Our details portfolio focuses on materials, finishes, custom moments, and carefully resolved intersections that elevate the full space.',
    coverImage: heroimage1,
    projects: [
      { title: 'Light Shelf', image: heroimage1 },
      { title: 'Oak Edge', image: heroimage3 },
      { title: 'Tone Wall', image: heroimage2 },
      { title: 'Stone Line', image: heroimage3 },
      { title: 'Craft Joinery', image: heroimage1 },
      { title: 'Warm Accent', image: heroimage2 },
      { title: 'Soft Corner', image: heroimage3 },
      { title: 'Framed Niche', image: heroimage1 },
      { title: 'Texture Wall', image: heroimage2 },
      { title: 'Calm Passage', image: heroimage1 },
      { title: 'Material Edge', image: heroimage3 },
      { title: 'Layered Shelf', image: heroimage2 }
    ]
  }
];

export function getProjectCategory(slug) {
  return projectCategories.find((category) => category.slug === slug) ?? projectCategories[0];
}

export function getProjectCategoriesWithImages(databaseImages = []) {
  return projectCategories.map((category) => {
    const imagesForCategory = databaseImages
      .filter((image) => image.category_slug === category.slug)
      .sort((first, second) => {
        const sortDifference = Number(first.sort_order || 0) - Number(second.sort_order || 0);
        return sortDifference || Number(first.id || 0) - Number(second.id || 0);
      });

    if (imagesForCategory.length === 0) {
      return category;
    }

    const projects = imagesForCategory.map((image) => ({
      id: image.id,
      title: image.title,
      image: image.image_url
    }));

    return {
      ...category,
      coverImage: projects[0].image,
      projects
    };
  });
}

export function getProjectCategoryFromList(categories, slug) {
  return categories.find((category) => category.slug === slug) ?? categories[0];
}
