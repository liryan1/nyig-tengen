"use client";

import Image from "next/image";

const featuredSites: FeaturedSite[] = [
  {
    imageUrl: "/nyig.png",
    imageHeight: 400,
    imageWidth: 600,
    description: "Go classes and camps taught by top instructors nationwide",
    link: "https://ny-go.org",
  },
  {
    imageUrl: "/goproblem.png",
    imageHeight: 285,
    imageWidth: 285,
    description: "Master Go tactics with free expert-designed challenges",
    link: "https://go-problem-test.web.app/",
  },
];

export type FeaturedSite = {
  imageUrl: string;
  imageHeight: number;
  imageWidth: number;
  description: string;
  link: string;
};

export function FeaturedSites() {
  return (
    <div className="container mx-auto">
      <h2 className="text-2xl font-medium text-center mb-6">Featured</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {featuredSites.map((site, index) => (
          <div
            key={index}
            className="flex flex-col rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <a href={site.link} target="_blank" rel="noopener noreferrer">
              <div className="flex items-center justify-center">
                <Image
                  height={site.imageHeight}
                  width={site.imageWidth}
                  src={site.imageUrl}
                  alt=""
                  className="rounded-t-lg object-cover"
                />
              </div>
              <div className="p-4">
                <p className="text-muted-foreground">{site.description}</p>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
