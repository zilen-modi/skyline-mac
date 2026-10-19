"use client";

import { useEffect, useState } from "react";
import { Copy, FileText, Send } from "lucide-react";
import { useWM, type AppProps } from "@/lib/store";
import { copyText } from "@/lib/hooks";
import { profile } from "@/data/portfolio";
import { GitHub, LinkedIn } from "@/components/icons/Brand";

type Field = "name" | "email" | "subject" | "message";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(v: Record<Field, string>) {
  const e: Partial<Record<Field, string>> = {};
  if (!v.name.trim()) e.name = "Please add your name.";
  if (!v.email.trim()) e.email = "Please add your email so I can reply.";
  else if (!EMAIL.test(v.email.trim())) e.email = "That email address doesn't look right.";
  if (v.message.trim().length < 10) e.message = "Write at least a sentence (10+ characters).";
  return e;
}

// No backend: sending opens the visitor's own mail app with everything filled in.
export default function Mail({ props }: { props: AppProps }) {
  const { notify, open } = useWM.getState();
  const [v, setV] = useState<Record<Field, string>>({ name: "", email: "", subject: (props.subject as string) ?? "", message: "" });
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [tried, setTried] = useState(false);
  const errors = validate(v);

  useEffect(() => {
    if (props.subject) setV((x) => ({ ...x, subject: props.subject as string }));
  }, [props.nonce, props.subject]);

  const show = (f: Field) => (tried || touched[f]) && errors[f];

  function send(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    if (Object.keys(errors).length) {
      document.getElementById(`mail-${Object.keys(errors)[0]}`)?.focus();
      return;
    }
    const subject = v.subject.trim() || `Hello from ${v.name.trim()}`;
    const body = `${v.message.trim()}\n\n— ${v.name.trim()} (${v.email.trim()})`;
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    notify("Opening your mail app…");
  }

  async function copy() {
    notify((await copyText(profile.email)) ? "Email address copied" : profile.email);
  }

  const input = (f: Field, label: string, type = "text", extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className={`mf-row${show(f) ? " bad" : ""}`}>
      <label htmlFor={`mail-${f}`}>{label}</label>
      <input
        id={`mail-${f}`}
        type={type}
        value={v[f]}
        onChange={(e) => setV({ ...v, [f]: e.target.value })}
        onBlur={() => setTouched({ ...touched, [f]: true })}
        aria-invalid={!!show(f)}
        aria-describedby={show(f) ? `mail-${f}-err` : undefined}
        {...extra}
      />
      {show(f) && <span className="mf-err" id={`mail-${f}-err`}>{errors[f]}</span>}
    </div>
  );

  return (
    <div className="mail">
      <form className="compose" onSubmit={send} noValidate>
        <div className="toolbar">
          <button type="submit" className="btn small primary"><Send size={14} />Send</button>
          <span className="grow" />
          <span className="mail-hint">Opens in your email app</span>
        </div>
        <div className="mf-row to">
          <span className="mf-label">To:</span>
          <span className="to-chip">{profile.name} &lt;{profile.email}&gt;</span>
          <button type="button" className="icon-btn small" aria-label="Copy email address" title="Copy email" onClick={copy}><Copy size={14} /></button>
        </div>
        {input("name", "Your name:", "text", { autoComplete: "name" })}
        {input("email", "Your email:", "email", { autoComplete: "email" })}
        {input("subject", "Subject:", "text", { placeholder: "Optional" })}
        <div className={`mf-msg${show("message") ? " bad" : ""}`}>
          <label htmlFor="mail-message" className="sr-only">Message</label>
          <textarea
            id="mail-message"
            value={v.message}
            onChange={(e) => setV({ ...v, message: e.target.value })}
            onBlur={() => setTouched({ ...touched, message: true })}
            placeholder={`Hi ${profile.firstName}, …`}
            aria-invalid={!!show("message")}
            aria-describedby={show("message") ? "mail-message-err" : undefined}
          />
          {show("message") && <span className="mf-err" id="mail-message-err">{errors.message}</span>}
        </div>
      </form>
      <aside className="mail-side" aria-label="Other ways to reach me">
        <p className="side-h">Other ways</p>
        <button className="side-link" onClick={copy}><Copy size={15} /><span>Copy email<small>{profile.email}</small></span></button>
        <a className="side-link" href={profile.linkedin} target="_blank" rel="noopener noreferrer"><LinkedIn size={15} /><span>LinkedIn<small>Fastest reply</small></span></a>
        <a className="side-link" href={profile.github} target="_blank" rel="noopener noreferrer"><GitHub size={15} /><span>GitHub<small>{profile.github.replace(/^https?:\/\/(www\.)?/, "")}</small></span></a>
        <button className="side-link" onClick={() => open("preview")}><FileText size={15} /><span>Resume<small>View or print</small></span></button>
      </aside>
    </div>
  );
}
