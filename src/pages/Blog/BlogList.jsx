import React from "react";
import { Calendar, Clock, User, ChevronRight } from "lucide-react";

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
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSN0Y_SeJHZINmA_vwcN_rR71JW9wJXegQWiA&s",
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
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSN0Y_SeJHZINmA_vwcN_rR71JW9wJXegQWiA&s",
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
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSN0Y_SeJHZINmA_vwcN_rR71JW9wJXegQWiA&s",
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
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSN0Y_SeJHZINmA_vwcN_rR71JW9wJXegQWiA&s",
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
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSN0Y_SeJHZINmA_vwcN_rR71JW9wJXegQWiA&s",
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
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSN0Y_SeJHZINmA_vwcN_rR71JW9wJXegQWiA&s",
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
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSN0Y_SeJHZINmA_vwcN_rR71JW9wJXegQWiA&s",
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
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSN0Y_SeJHZINmA_vwcN_rR71JW9wJXegQWiA&s",
  },
];

export default function BlogList() {
  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-12 text-white">
          Featured Blog Posts
        </h1>
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <div
              key={post.id}
              className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105"
            >
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-blue-400">
                    {post.category}
                  </span>
                  <div className="flex items-center text-gray-400 text-sm">
                    <Clock size={14} className="mr-1" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
                <h2 className="text-xl font-bold mb-2 text-white">
                  {post.title}
                </h2>
                <p className="text-gray-300 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User size={16} className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-400">{post.author}</span>
                  </div>
                  <div className="flex items-center text-gray-400 text-sm">
                    <Calendar size={14} className="mr-1" />
                    <span>{post.date}</span>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-700 border-t border-gray-600">
                <a
                  href="#"
                  className="text-blue-400 font-semibold flex items-center hover:text-blue-300 transition-colors duration-300"
                >
                  Read More
                  <ChevronRight size={16} className="ml-1" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
