import Desktop from "@/components/Desktop";
import { experiences, profile, projects } from "@/data/portfolio";

export default function Home() {
  return (
    <>
      <h1 className="sr-only">{profile.name}: {profile.role}</h1>
      <Desktop />
      {/* Without JavaScript there's no desktop, so show the essentials as a plain page. */}
      <noscript>
        <div className="classic">
          <h2>{profile.name}</h2>
          <p>{profile.headline}</p>
          <p>{profile.tagline}</p>
          <p><a href={`mailto:${profile.email}`}>{profile.email}</a> · <a href={profile.linkedin}>LinkedIn</a> · <a href={profile.github}>GitHub</a></p>
          <h3>Projects</h3>
          <ul>{projects.map((p) => <li key={p.id}><strong>{p.title}</strong>: {p.summary}</li>)}</ul>
          <h3>Experience</h3>
          <ul>{experiences.map((e) => <li key={e.id}>{e.role}, {e.company} ({e.period})</li>)}</ul>
        </div>
      </noscript>
    </>
  );
}
