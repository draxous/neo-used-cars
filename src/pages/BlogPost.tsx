import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Info,
  AlertTriangle,
  Lightbulb,
  Share2,
  Tag,
  User,
} from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import NotFound from "./NotFound";
import { Button } from "@/components/ui/button";
import { getBlogPostBySlug, getRelatedBlogs, BlogPost } from "@/data/blogs";
import { toast } from "sonner";

const BlogPostPage = () => {
  const { slug } = useParams();
  const blog = slug ? getBlogPostBySlug(slug) : undefined;

  if (!blog) return <NotFound />;

  const related = getRelatedBlogs(blog.slug, 2);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.subtitle,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Article link copied to clipboard!");
    }
  };

  const blogPostSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://neojapancars.com/" },
          { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://neojapancars.com/blog" },
          { "@type": "ListItem", "position": 3, "name": blog.title, "item": `https://neojapancars.com/blog/${blog.slug}` },
        ],
      },
      {
        "@type": "BlogPosting",
        "@id": `https://neojapancars.com/blog/${blog.slug}#article`,
        "headline": blog.title,
        "alternativeHeadline": blog.subtitle,
        "description": blog.description,
        "image": blog.image,
        "datePublished": blog.isoDate,
        "dateModified": blog.isoDate,
        "author": {
          "@type": "Person",
          "name": blog.author.name,
          "jobTitle": blog.author.role,
        },
        "publisher": {
          "@type": "AutoDealer",
          "name": "Neo Trading Co., Ltd",
          "url": "https://neojapancars.com/",
          "logo": {
            "@type": "ImageObject",
            "url": "https://neojapancars.com/logo.svg",
          },
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://neojapancars.com/blog/${blog.slug}`,
        },
        "keywords": blog.keywords,
      },
    ],
  };

  return (
    <Layout>
      <SEOHead
        title={`${blog.title} | Neo Trading`}
        description={blog.description}
        keywords={blog.keywords}
        canonicalUrl={`/blog/${blog.slug}`}
        ogImage={blog.image}
        ogType="article"
        jsonLd={blogPostSchema}
      />

      {/* Breadcrumbs */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center flex-wrap gap-1 text-xs sm:text-sm text-muted-foreground"
          >
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/blog" className="hover:text-primary transition-colors">
              Blog
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground line-clamp-1 max-w-md">{blog.title}</span>
          </nav>
        </div>
      </div>

      <article className="container mx-auto px-4 py-10 max-w-4xl">
        {/* Article Meta Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
              {blog.category}
            </span>
            {blog.market === "US" && (
              <span className="bg-secondary text-foreground text-xs font-semibold px-3 py-1 rounded-full border border-border">
                🇺🇸 US Market Focus
              </span>
            )}
            {blog.market === "UK" && (
              <span className="bg-secondary text-foreground text-xs font-semibold px-3 py-1 rounded-full border border-border">
                🇬🇧 UK Market Focus
              </span>
            )}
            <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {blog.readTime}
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground leading-[1.2] mb-4">
            {blog.title}
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6">
            {blog.subtitle}
          </p>

          <div className="flex items-center justify-between py-4 border-y border-border text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full hero-gradient text-primary-foreground flex items-center justify-center font-bold">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{blog.author.name}</p>
                <p className="text-xs text-muted-foreground">{blog.author.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-muted-foreground hidden sm:flex items-center gap-1 text-xs">
                <Calendar className="h-3.5 w-3.5" />
                {blog.publishedAt}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="gap-1.5 text-xs"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-10 card-shadow">
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Sections */}
        <div className="space-y-10 text-foreground leading-relaxed">
          {blog.sections.map((section, idx) => (
            <section key={idx} className="space-y-4">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground pt-4 border-t border-border/40">
                {section.heading}
              </h2>

              {section.content.map((paragraph, pIdx) => (
                <p key={pIdx} className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {paragraph}
                </p>
              ))}

              {section.keyPoints && (
                <ul className="grid sm:grid-cols-2 gap-2.5 my-4 bg-secondary/30 p-5 rounded-xl border border-border">
                  {section.keyPoints.map((point, kIdx) => (
                    <li key={kIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.table && (
                <div className="overflow-x-auto my-6 border border-border rounded-xl">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-secondary/60 border-b border-border">
                        {section.table.headers.map((h, hIdx) => (
                          <th key={hIdx} className="p-3.5 font-semibold text-foreground">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {section.table.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-secondary/20">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-3.5 text-muted-foreground">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {section.callout && (
                <div
                  className={`p-5 rounded-xl border my-4 flex items-start gap-3.5 ${
                    section.callout.type === "tip"
                      ? "bg-accent/10 border-accent/30 text-accent-foreground"
                      : section.callout.type === "warning"
                      ? "bg-destructive/10 border-destructive/30 text-destructive-foreground"
                      : "bg-primary/10 border-primary/30 text-foreground"
                  }`}
                >
                  {section.callout.type === "tip" && (
                    <Lightbulb className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  )}
                  {section.callout.type === "warning" && (
                    <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  )}
                  {section.callout.type === "info" && (
                    <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-foreground mb-1">
                      {section.callout.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {section.callout.text}
                    </p>
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Tags */}
        <div className="mt-10 pt-6 border-t border-border flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground mr-2 font-medium">Tags:</span>
          {blog.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-xs bg-secondary px-3 py-1 rounded-full text-foreground"
            >
              <Tag className="h-3 w-3 text-accent" />
              {tag}
            </span>
          ))}
        </div>

        {/* In-Article Sourcing Action Banner */}
        <div className="mt-12 bg-gradient-to-r from-primary/15 via-secondary to-accent/15 border border-primary/20 rounded-2xl p-8 text-center">
          <h3 className="font-display text-2xl font-bold text-foreground mb-2">
            Ready to import this vehicle to your destination?
          </h3>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto mb-6">
            Neo Trading provides direct access to 150+ live Japanese vehicle auctions with translated inspection sheets 
            and complete RoRo/container export to the US, UK, and worldwide ports.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Link to="/inquiry">
                Request Free Sourcing Quote
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/stock-cars">
                Browse Stock Cars
              </Link>
            </Button>
          </div>
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <div className="mt-14 pt-10 border-t border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Related Articles
              </h2>
              <Button asChild variant="ghost" size="sm" className="gap-1">
                <Link to="/blog">
                  View All Posts <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {related.map((rel: BlogPost) => (
                <Link
                  key={rel.id}
                  to={`/blog/${rel.slug}`}
                  className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all card-shadow group flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                      {rel.category}
                    </span>
                    <h3 className="font-display font-bold text-foreground text-base group-hover:text-primary transition-colors mt-1 mb-2">
                      {rel.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {rel.subtitle}
                    </p>
                  </div>
                  <span className="text-xs text-primary font-semibold inline-flex items-center gap-1 mt-4">
                    Read article <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Button asChild variant="ghost" className="gap-2 text-muted-foreground">
            <Link to="/blog">
              <ArrowLeft className="h-4 w-4" /> Back to all articles
            </Link>
          </Button>
        </div>
      </article>
    </Layout>
  );
};

export default BlogPostPage;
