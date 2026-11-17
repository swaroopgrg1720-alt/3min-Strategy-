export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
  improvements: string[];
  fixes: string[];
}

/** Only list versions that actually exist. Add new entries on top when you release. */
export const changelog: ChangelogEntry[] = [
  {
    version: "1.0.0",
    date: "[RELEASE DATE]",
    changes: ["Initial release."],
    improvements: [],
    fixes: [],
  },
];

export const currentVersion = changelog[0].version;
