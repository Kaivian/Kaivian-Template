"use client";

import { useEffect, useState } from "react";
import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import { healthService } from "@/services/api/healthService";

export default function Home() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const check = async () => {
      const ok = await healthService.checkHealth();
      setStatus(ok ? "success" : "error");
    };
    check();
  }, []);

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center">
        <span className={title()}>Make&nbsp;</span>
        <span className={title({ color: "violet" })}>beautiful&nbsp;</span>
        <br />
        <span className={title()}>
          websites regardless of your design experience.
        </span>
        <div className={subtitle({ class: "mt-4" })}>
          Beautiful, fast and modern React UI library.
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          isExternal
          className={buttonStyles({
            color: "primary",
            radius: "full",
            variant: "shadow",
          })}
          href={siteConfig.links.docs}
        >
          Documentation
        </Link>
        <Link
          isExternal
          className={buttonStyles({ variant: "bordered", radius: "full" })}
          href={siteConfig.links.github}
        >
          <GithubIcon size={20} />
          GitHub
        </Link>
      </div>

      <div className="mt-8">
        <Snippet hideCopyButton hideSymbol variant="bordered">
          <span>
            Get started by editing <Code color="primary">app/page.tsx</Code>
          </span>
        </Snippet>
      </div>

      <div className="mt-8">
        {status === "loading" && (
          <Chip variant="flat" color="default" startContent={<Spinner size="sm" />}>
            Checking connection...
          </Chip>
        )}
        {status === "success" && (
          <Chip variant="flat" color="success">✅ Server Connected</Chip>
        )}
        {status === "error" && (
          <Chip variant="flat" color="danger">❌ Server Connection Failed</Chip>
        )}
      </div>
    </section>
  );
}