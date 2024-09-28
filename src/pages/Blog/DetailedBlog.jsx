import React from "react";
import {
  Calendar,
  Clock,
  User,
  Tag,
  ThumbsUp,
  MessageCircle,
  Share2,
  Bookmark,
} from "lucide-react";

export default function EnhancedColorDetailedBlogPost() {
  return (
    <div className="bg-[#36393f] min-h-screen text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
      <article className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-4">
            The Art of Minimalist Design in Modern Web Development
          </h1>
          <div className="flex flex-wrap items-center text-sm text-gray-400 mb-4">
            <div className="flex items-center mr-4 mb-2">
              <User size={16} className="mr-2" />
              <span>Alex Johnson</span>
            </div>
            <div className="flex items-center mr-4 mb-2">
              <Calendar size={16} className="mr-2" />
              <span>May 15, 2023</span>
            </div>
            <div className="flex items-center mr-4 mb-2">
              <Clock size={16} className="mr-2" />
              <span>5 min read</span>
            </div>
            <div className="flex items-center mb-2">
              <Tag size={16} className="mr-2" />
              <span className="text-teal-400">Design</span>
              <span className="mx-2">•</span>
              <span className="text-teal-400">Web Development</span>
            </div>
          </div>
          <img
            src="https://images2.thanhnien.vn/528068263637045248/2024/1/25/e093e9cfc9027d6a142358d24d2ee350-65a11ac2af785880-17061562929701875684912.jpg"
            alt="Minimalist Web Design"
            className="w-full h-64 sm:h-96 object-cover rounded-lg mb-4"
          />
        </header>

        <div className="prose prose-invert prose-teal max-w-none">
          <p className="mb-4 text-gray-300">
            In the ever-evolving world of web development, minimalist design has
            emerged as a powerful approach to creating stunning and efficient
            web experiences. This article explores the principles of minimalist
            design and how they can be applied to modern web development
            projects.
          </p>

          <h2 className="text-2xl font-bold text-gray-100 mt-8 mb-4">
            What is Minimalist Design?
          </h2>
          <p className="mb-4 text-gray-300">
            Minimalist design is an approach that strips away unnecessary
            elements, focusing on the essential. In web development, this
            translates to clean layouts, ample white space, and a focus on
            typography and functionality.
          </p>

          <h2 className="text-2xl font-bold text-gray-100 mt-8 mb-4">
            Key Principles of Minimalist Web Design
          </h2>
          <ul className="list-disc pl-6 mb-4 text-gray-300">
            <li>Simplicity in layout and navigation</li>
            <li>Use of negative space</li>
            <li>Limited color palette</li>
            <li>Typography as a design element</li>
            <li>Purposeful use of images and icons</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-100 mt-8 mb-4">
            Benefits of Minimalist Design in Web Development
          </h2>
          <p className="mb-4 text-gray-300">
            Adopting a minimalist approach in web development offers several
            advantages:
          </p>
          <ol className="list-decimal pl-6 mb-4 text-gray-300">
            <li>Improved user experience and navigation</li>
            <li>Faster loading times</li>
            <li>Enhanced mobile responsiveness</li>
            <li>Greater focus on content</li>
            <li>Timeless aesthetic that ages well</li>
          </ol>

          <p className="mb-4 text-gray-300">
            By embracing these principles, developers can create websites that
            are not only visually appealing but also highly functional and
            user-friendly.
          </p>

          <blockquote className="border-l-4 border-teal-400 pl-4 py-2 mb-4 italic text-gray-400">
            "Simplicity is the ultimate sophistication." - Leonardo da Vinci
          </blockquote>

          <h2 className="text-2xl font-bold text-gray-100 mt-8 mb-4">
            Implementing Minimalist Design in Your Projects
          </h2>
          <p className="mb-4 text-gray-300">
            When incorporating minimalist design principles into your web
            development projects, consider the following steps:
          </p>
          <ol className="list-decimal pl-6 mb-4 text-gray-300">
            <li>Audit your current design and remove unnecessary elements</li>
            <li>Prioritize content and features based on user needs</li>
            <li>Choose a limited color palette that aligns with your brand</li>
            <li>
              Utilize whitespace effectively to improve readability and focus
            </li>
            <li>
              Select typography that enhances the overall design aesthetic
            </li>
          </ol>

          <p className="mb-4 text-gray-300">
            Remember, the goal of minimalist design is not just to create a
            visually appealing website, but to enhance the user experience by
            simplifying navigation and focusing on essential content.
          </p>
        </div>

        <footer className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <button className="flex items-center text-gray-400 hover:text-teal-400 transition-colors duration-300">
                <ThumbsUp size={20} className="mr-2" />
                <span>1.2k Likes</span>
              </button>
              <button className="flex items-center text-gray-400 hover:text-teal-400 transition-colors duration-300">
                <MessageCircle size={20} className="mr-2" />
                <span>56 Comments</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center text-gray-400 hover:text-teal-400 transition-colors duration-300">
                <Share2 size={20} className="mr-2" />
                <span>Share</span>
              </button>
              <button className="flex items-center text-gray-400 hover:text-teal-400 transition-colors duration-300">
                <Bookmark size={20} className="mr-2" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
}
