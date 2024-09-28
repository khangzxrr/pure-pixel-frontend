import React from "react";
import { Calendar, Clock, User, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const blogPosts = [
  {
    id: 1,
    title: "The Art of Minimalist Design in Modern Web Development",
    excerpt:
      "Explore how minimalist design principles can create stunning and efficient web experiences...",
    author: "Alex Johnson",
    date: "May 15, 2023",
    readTime: "5 min read",
    category: "Design",
    image: "https://images2.thanhnien.vn/528068263637045248/2024/1/25/e093e9cfc9027d6a142358d24d2ee350-65a11ac2af785880-17061562929701875684912.jpg",
  },
  {
    id: 2,
    title: "10 Must-Know JavaScript Tricks for 2023",
    excerpt:
      "Discover the latest JavaScript techniques that will boost your productivity and code quality...",
    author: "Emily Chen",
    date: "June 2, 2023",
    readTime: "8 min read",
    category: "Development",
    image: "https://images2.thanhnien.vn/528068263637045248/2024/1/25/e093e9cfc9027d6a142358d24d2ee350-65a11ac2af785880-17061562929701875684912.jpg",
  },
  {
    id: 3,
    title: "The Future of AI in Web Design: Trends to Watch",
    excerpt:
      "Uncover how artificial intelligence is reshaping the landscape of web design and user experiences...",
    author: "Michael Smith",
    date: "June 10, 2023",
    readTime: "6 min read",
    category: "Technology",
    image: "https://images2.thanhnien.vn/528068263637045248/2024/1/25/e093e9cfc9027d6a142358d24d2ee350-65a11ac2af785880-17061562929701875684912.jpg",
  },
];

export default function EnhancedColorBlogList() {
  return (
    <div className="min-h-screen bg-[#36393f]">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-100">
          Featured Blog Posts
        </h1>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <div
              key={post.id}
              className="bg-[#2f3136] rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105"
            >
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-white">
                    {post.category}
                  </span>
                  <div className="flex items-center text-gray-400 text-sm">
                    <Clock size={14} className="mr-1" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
                <h2 className="text-xl font-bold mb-2 text-gray-100">
                  {post.title}
                </h2>
                <p className="text-gray-400 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User size={16} className="text-gray-500 mr-2" />
                    <span className="text-sm text-gray-500">{post.author}</span>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar size={14} className="mr-1" />
                    <span>{post.date}</span>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-[#202225] border-t border-gray-600">
                <Link
                  to="/blog/123"
                  className="text-[#57afdd] font-semibold flex items-center hover:text-[#eeeeee] transition-colors duration-300"
                >
                  Read More
                  <ChevronRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
