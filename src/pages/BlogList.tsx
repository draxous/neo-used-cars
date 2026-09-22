import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Calendar, Clock, Search, Tag, User } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { blogs, BlogPost } from "@/data/blogs";

const categories = ["All Posts", "US Market", "UK Market", "JDM Classics", "Auction Guides"] as const;

const BlogList = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Posts");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredBlogs = blogs.filter((blog) => {
    const matchesCategory =
      selectedCategory === "All Posts" || blog.category === selectedCategory;
    const matchesSearch =
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Neo Trading Blog — Auto Imports from Japan",
    "description": "Expert insights, import regulations, and guides on buying JDM cars and importing auto from Japan to the US and UK markets.",
    "url": "https://neojapancars.com/blog",
    "publisher": {
      "@type": "AutoDealer",
      "name": "Neo Trading Co., Ltd",
      "url": "https://neojapancars.com/",
    },
    "blogPost": blogs.map((b) => ({
      "@type": "BlogPosting",
      "headline": b.title,
      "description": b.description,
      "datePublished": b.isoDate,
      "url": `https://neojapancars.com/blog/${b.slug}`,
      "author": {
        "@type": "Person",
        "name": b.author.name,
      },
    })),
  };

  return (
    <Layout>
      <SEOHead
        title="JDM & Auto Import Blog | US & UK Market Guides - Neo Trading"
        description="Expert insights on auto imports from Japan, JDM sports cars, US 25-year rule exemptions, UK IVA and DVLA registration, and Japanese auction bidding guides."
        keywords="auto imports from japan blog, JDM car import guide, import cars to usa blog, import cars to uk blog, japanese auction blog, 25 year rule JDM"
        canonicalUrl="/blog"
        jsonLd={blogSchema}
      />

      {/* Hero Header */}
      <section className="bg-card border-b border-border py-12">
        <div className="container mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-xs sm:text-sm font-semibold rounded-full mb-3">
            <BookOpen className="h-4 w-4" />
            Insights & Guides
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground">
            Auto Imports & <span className="text-primary">JDM Insights</span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl text-sm sm:text-base leading-relaxed">
            In-depth guides, compliance updates, and market intelligence for enthusiasts and dealers 
            importing Japanese domestic vehicles to the US, UK, and worldwide.
          </p>

          {/* Search & Filter bar */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search articles, JDM models, or country rules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-2 mt-5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <main className="container mx-auto px-4 py-10">
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <p className="text-muted-foreground">No articles match your search or filter.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSelectedCategory("All Posts");
                setSearchQuery("");
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {filteredBlogs.map((blog: BlogPost) => (
              <article
                key={blog.id}
                className="bg-card border border-border rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all flex flex-col justify-between group"
              >
                <div>
                  <Link to={`/blog/${blog.slug}`} className="block relative aspect-[16/9] overflow-hidden bg-secondary">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="bg-primary/90 text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm">
                        {blog.category}
                      </span>
                      {blog.market === "US" && (
                        <span className="bg-background/90 text-foreground text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm flex items-center gap-1">
                          🇺🇸 US Market
                        </span>
                      )}
                      {blog.market === "UK" && (
                        <span className="bg-background/90 text-foreground text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm flex items-center gap-1">
                          🇬🇧 UK Market
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="p-6">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {blog.publishedAt}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {blog.readTime}
                      </span>
                    </div>

                    <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors leading-snug mb-2">
                      <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
                    </h2>

                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                      {blog.subtitle}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {blog.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 text-[11px] bg-secondary px-2 py-0.5 rounded text-muted-foreground"
                        >
                          <Tag className="h-2.5 w-2.5 text-accent" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-0 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground mt-2">
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <User className="h-3.5 w-3.5 text-primary" />
                    {blog.author.name}
                  </span>
                  <Link
                    to={`/blog/${blog.slug}`}
                    className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
                  >
                    Read Article <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Sourcing Banner */}
        <div className="mt-14 bg-gradient-to-r from-primary/10 via-card to-accent/10 border border-primary/20 rounded-2xl p-8 text-center max-w-3xl mx-auto">
          <h3 className="font-display text-2xl font-bold text-foreground mb-2">
            Looking to import a specific vehicle to the US or UK?
          </h3>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto mb-6">
            Tell us the exact make, model, year, and arrival port. Our Tokyo team will conduct a free auction search 
            and quote CIF shipping directly to you.
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Link to="/inquiry">
              Request Free Sourcing & CIF Quote
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>
    </Layout>
  );
};

export default BlogList;
