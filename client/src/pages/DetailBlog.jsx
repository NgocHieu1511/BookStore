import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { requestGetOneBlog } from "../config/blogRequest";

function DetailBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const res = await requestGetOneBlog({ idBlog: id });
        if (!ignore) {
          setBlog(res.metadata);
          document.title = `${res.metadata.nameBlog} | Book Store`;
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
        navigate("/notfound", { replace: true });
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchBlog();
    window.scrollTo({ top: 0 });
    return () => { ignore = true; };
  }, [id, navigate]);

  return (
    <div className="min-h-screen bg-[#F2F4F5] text-[#191c1d]">
      <Header />

      <main className="mx-auto w-full max-w-[900px] px-3 py-4 md:px-6">
        <nav className="flex items-center gap-1 text-sm text-gray-500">
          <Link to="/" className="hover:text-[#c92127]">Trang chủ</Link>
          <ChevronRight size={14} />
          <Link to="/blogs" className="hover:text-[#c92127]">Bài viết</Link>
          <ChevronRight size={14} />
          <span className="line-clamp-1 font-semibold text-[#191c1d]">{blog?.nameBlog}</span>
        </nav>

        <article className="mt-4 rounded-lg bg-white p-4 shadow-sm md:p-8">
          {loading || !blog ? (
            <div className="space-y-3">
              <div className="h-8 w-3/4 animate-pulse rounded bg-[#f2f4f5]" />
              <div className="h-64 animate-pulse rounded bg-[#f2f4f5]" />
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold md:text-3xl">{blog.nameBlog}</h1>
              <p className="mt-2 text-sm text-gray-400">
                {new Date(blog.createdAt).toLocaleDateString("vi-VN")}
              </p>
              <img
                src={blog.image}
                alt={blog.nameBlog}
                className="mt-4 max-h-[420px] w-full rounded-lg object-cover"
              />
              {/* Nội dung HTML do TinyMCE tạo ra */}
              <div
                className="blog-content mt-6"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </>
          )}
        </article>
      </main>

      <Footer />
    </div>
  );
}

export default DetailBlog;