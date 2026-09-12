import React from "react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabaseClient";

const categories = ["All", "Study", "Events", "Projects", "Clubs", "Career"];

function AuthBox({ onDone }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const result =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === "signup") {
      setMessage("Account created. If email confirmation is enabled, check your inbox.");
    } else {
      onDone?.();
    }
  }

  return (
    <div className="auth-card">
      <div>
        <span className="eyebrow">ACCOUNT</span>
        <h2>{mode === "signin" ? "Welcome back" : "Create your account"}</h2>
        <p className="muted">
          {mode === "signin"
            ? "Sign in to add and manage your campus resources."
            : "Create an account to contribute resources."}
        </p>
      </div>

      <form onSubmit={submit} className="stack">
        <input
          type="email"
          placeholder="College email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password (6+ characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        <button className="primary" disabled={loading}>
          {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Sign up"}
        </button>
      </form>

      {message && <p className="notice">{message}</p>}

      <button
        className="link-button"
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setMessage("");
        }}
      >
        {mode === "signin"
          ? "New here? Create an account"
          : "Already have an account? Sign in"}
      </button>
    </div>
  );
}

function ResourceForm({ user, onAdded }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Study",
    url: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(key, value) {
    setForm((old) => ({ ...old, [key]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const { data, error } = await supabase
      .from("resources")
      .insert({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        url: form.url.trim(),
        user_id: user.id,
      })
      .select()
      .single();

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    setForm({ title: "", description: "", category: "Study", url: "" });
    onAdded(data);
  }

  return (
    <form className="resource-form" onSubmit={submit}>
      <div>
        <span className="eyebrow">CONTRIBUTE</span>
        <h2>Add a resource</h2>
        <p className="muted">Share something useful with other students.</p>
      </div>

      <div className="form-grid">
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          required
        />
        <select value={form.category} onChange={(e) => update("category", e.target.value)}>
          {categories.slice(1).map((c) => <option key={c}>{c}</option>)}
        </select>
        <input
          className="full"
          placeholder="Short description"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          required
        />
        <input
          className="full"
          type="url"
          placeholder="https://..."
          value={form.url}
          onChange={(e) => update("url", e.target.value)}
          required
        />
      </div>

      {error && <p className="error">{error}</p>}
      <button className="primary" disabled={saving}>
        {saving ? "Publishing..." : "Publish resource"}
      </button>
    </form>
  );
}

function ResourceCard({ item, user, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const mine = user?.id === item.user_id;

  async function remove() {
    if (!confirm("Delete this resource?")) return;
    setDeleting(true);
    const { error } = await supabase.from("resources").delete().eq("id", item.id);
    setDeleting(false);
    if (!error) onDelete(item.id);
    else alert(error.message);
  }

  return (
    <article className="resource-card">
      <div className="card-top">
        <span className="tag">{item.category}</span>
        <span className="date">
          {new Date(item.created_at).toLocaleDateString()}
        </span>
      </div>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <div className="card-actions">
        <a href={item.url} target="_blank" rel="noreferrer" className="secondary">
          Open resource ↗
        </a>
        {mine && (
          <button className="danger" onClick={remove} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>
    </article>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    loadResources();
  }, []);

  async function loadResources() {
    setLoading(true);
    setLoadError("");

    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("created_at", { ascending: false });

    setLoading(false);

    if (error) setLoadError(error.message);
    else setResources(data || []);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return resources.filter((r) => {
      const matchesCategory = category === "All" || r.category === category;
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [resources, search, category]);

  function addResource(item) {
    setResources((old) => [item, ...old]);
  }

  function deleteResource(id) {
    setResources((old) => old.filter((r) => r.id !== id));
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <div className="app">
      <header className="nav">
        <div className="brand">
          <div className="logo">C</div>
          <div>
            <strong>CampusHub</strong>
            <span>Student resources, in one place.</span>
          </div>
        </div>

        <div className="nav-actions">
          {session ? (
            <>
              <span className="user-email">{session.user.email}</span>
              <button className="secondary" onClick={signOut}>Sign out</button>
            </>
          ) : (
            <button className="primary small" onClick={() => setShowAuth(true)}>
              Sign in
            </button>
          )}
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">BUILT FOR STUDENTS</span>
            <h1>Find what helps you <span>move forward.</span></h1>
            <p>
              A simple campus resource hub for study material, events,
              projects, clubs and career opportunities.
            </p>
            <div className="hero-actions">
              <a href="#resources" className="primary">Explore resources</a>
              {!session && (
                <button className="secondary" onClick={() => setShowAuth(true)}>
                  Become a contributor
                </button>
              )}
            </div>
          </div>

          <div className="hero-stat">
            <strong>{resources.length}</strong>
            <span>live resources</span>
            <small>stored in Supabase</small>
          </div>
        </section>

        {session && (
          <section className="section">
            <ResourceForm user={session.user} onAdded={addResource} />
          </section>
        )}

        <section className="section" id="resources">
          <div className="section-heading">
            <div>
              <span className="eyebrow">DISCOVER</span>
              <h2>Campus resources</h2>
            </div>
            <span className="count">{filtered.length} results</span>
          </div>

          <div className="toolbar">
            <input
              className="search"
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="filters">
              {categories.map((c) => (
                <button
                  key={c}
                  className={category === c ? "filter active" : "filter"}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {loading && <div className="state">Loading resources...</div>}
          {loadError && (
            <div className="state error">
              Could not load resources. Check your Supabase setup.
              <br />
              <small>{loadError}</small>
            </div>
          )}

          {!loading && !loadError && filtered.length === 0 && (
            <div className="state">
              <strong>No resources found.</strong>
              <span>Try another search or category.</span>
            </div>
          )}

          <div className="grid">
            {filtered.map((item) => (
              <ResourceCard
                key={item.id}
                item={item}
                user={session?.user}
                onDelete={deleteResource}
              />
            ))}
          </div>
        </section>
      </main>

      <footer>
        <strong>CampusHub</strong>
        <span>Built as a mini internet product for GCSRM Web Development recruitment.</span>
      </footer>

      {showAuth && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setShowAuth(false)}>
          <div className="modal">
            <button className="close" onClick={() => setShowAuth(false)}>×</button>
            <AuthBox onDone={() => setShowAuth(false)} />
          </div>
        </div>
      )}
    </div>
  );
}