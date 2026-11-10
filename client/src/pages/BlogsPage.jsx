import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Newspaper } from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import PaginationPage from "../components/Pagination/Pagination";
import TimeAgo from "../utils/TimeAgo";
import { requestGetBlogs } from "../config/blogRequest";

const PAGE_SIZE = 9;

// Bỏ thẻ HTML của TinyMCE để lấy đoạn trích ngắn
const getExcerpt = (html = "", max = 120) => {
  const text = html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  return text.length > max ? text.slice(0, max) + "..." : text;
};

function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const page = parseInt(new URLSearchParams(window.location.search).get("page"), 10) || 1;

  useEffect(() => {
    document.title = "Bài viết | Book Store";
    const fetchBlogs = async () => {
      try {
        const res = await requestGetBlogs();
        setBlogs(res.metadata || []);
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const totalPages = Math.ceil(blogs.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(totalPages, 1));
  const pagedBlogs = blogs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-[#F2F4F5] text-[#191c1d]">
      <Header />

      <main className="mx-auto w-full max-w-[1230px] px-3 py-4 md:px-6">
        <nav className="flex items-center gap-1 text-sm text-gray-500">
          <Link to="/" className="hover:text-[#c92127]">Trang chủ</Link>
          <ChevronRight size={14} />
          <span className="font-semibold text-[#191c1d]">Bài viết</span>
        </nav>

        <section className="mt-4 rounded-lg bg-white p-4 shadow-sm md:p-5">
          <h1 className="border-b border-gray-200 pb-4 text-xl font-bold uppercase md:text-2xl">
            Bài viết
          </h1>

          <div className="mt-4">
            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-72 animate-pulse rounded-lg bg-[#f2f4f5]" />
                ))}
              </div>
            ) : pagedBlogs.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pagedBlogs.map((blog) => (
                  <Link
                    key={blog._id}
                    to={`/blog/${blog._id}`}
                    className="group overflow-hidden rounded-lg border border-gray-100 transition hover:shadow-md"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                      <img
                        src={blog.image}
                        alt={blog.nameBlog}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-3">
                      <h2 className="line-clamp-2 text-base font-bold group-hover:text-[#c92127]">
                        {blog.nameBlog}
                      </h2>
                      <p className="mt-1 line-clamp-3 text-sm text-gray-600">
                        {getExcerpt(blog.content)}
                      </p>
                      <p className="mt-2 text-xs text-gray-400">
                        <TimeAgo createdAt={blog.createdAt} />
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
                <Newspaper size={56} strokeWidth={1.5} />
                <p>Chưa có bài viết nào.</p>
              </div>
            )}
          </div>

          {!loading && totalPages > 1 && (
            <div className="mt-6 border-t border-gray-200 pt-2">
              <PaginationPage totalPages={totalPages} />
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default BlogsPage;