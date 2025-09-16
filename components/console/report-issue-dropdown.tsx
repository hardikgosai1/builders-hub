"use client";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { usePathname } from "next/navigation";

interface ReportIssueDropdownProps {
  children: React.ReactNode;
}

export function ReportIssueDropdown({ children }: ReportIssueDropdownProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const pathname = usePathname();

  const MAX_TITLE_LENGTH = 100;

  const createGitHubIssue = (
    title: string,
    description: string,
    currentUrl: string
  ) => {
    const issueUrl = new URL(
      "https://github.com/ava-labs/builders-hub/issues/new"
    );

    const params = new URLSearchParams();
    params.append("title", title);
    params.append("labels", "Console");

    let body = description;
    if (body && body.trim()) { body += "\n\n" }
    body += `**Page URL:** ${currentUrl}`;

    params.append("body", body);
    issueUrl.search = params.toString();
    return issueUrl.toString();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const currentUrl = `https://build.avax.network${pathname}`;
    const issueUrl = createGitHubIssue(title, description, currentUrl);
    window.open(issueUrl, "_blank");
    toast({
      title: "Issue reported",
      description: "GitHub issue page opened. Thank you for your feedback!",
    });
    setTitle("");
    setDescription("");
    setIsSubmitting(false);
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setTitle("");
      setDescription("");
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 p-4" align="end">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Report an Issue</h3>
            <p className="text-xs text-muted-foreground">Help us improve by reporting bugs, suggesting features, or sharing feedback.</p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="title" className="text-xs">Title</Label>
              <Input
                id="title"
                name="title"
                value={title}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_TITLE_LENGTH) {
                    setTitle(e.target.value);
                  }
                }}
                placeholder="Brief description of the issue"
                className="h-8"
                maxLength={MAX_TITLE_LENGTH}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="description" className="text-xs">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide detailed information..."
                className="min-h-[80px] text-xs"
              />
            </div>
          </div>

          <div className="flex pt-2">
            <Button
              type="submit"
              size="sm"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
