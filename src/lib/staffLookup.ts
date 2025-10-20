// Staff lookup utility to map computing IDs to names
// Data sourced from groupExportAll_FBS_StaffAll.csv

export interface StaffMember {
  uid: string;
  email: string;
  universityId: string;
  name: string;
}

// Staff directory mapping computing ID to full name
// Format from CSV: "Lastname, Firstname (uid)"
const STAFF_DIRECTORY: Record<string, string> = {
  "acm8k": "Anne Mitchell Carter Mulligan",
  "am3de": "Amanda Joan Crombie",
  "amh4tb": "Andrea M Henry",
  "bac7d": "Bryan A Crenshaw",
  "bam5x": "Brandy A Marsh",
  "bcm2fj": "Elinor Tappe",
  "bh4hb": "Ben Hartless",
  "chm3b": "Cindy Moore",
  "cqk8gh": "Nicolo William Porto",
  "cr9dh": "Carey Masse Reinicke",
  "crl4sn": "Courtney Leistensnider",
  "csl3g": "Craig Selwyn Lindqvist",
  "djr6nf": "John Robinson",
  "dlw5qd": "Dakota Lee Workman",
  "eh4jc": "Beth Hill",
  "eyc4m": "Eileen Y Chou",
  "gwf3n": "George W Foresman",
  "hcx3mz": "Michael McMullin",
  "hld8m": "Heather L. Downs",
  "hye8yx": "John Michael Robinson",
  "ihs8m": "Ian H. Solomon",
  "jad5ec": "Corrin Lundquist",
  "jap8cc": "Adam Pearson",
  "jeh2jw": "Jon Holmsted",
  "jlc2bd": "Jeff L Chidester",
  "jll4m": "Jennifer Lynne Ludovici",
  "jrc2jc": "James Cathro",
  "jsm2ku": "Jill S Rockwell",
  "jww8je": "Jeffrey Wayne Whelchel",
  "kdt4d": "Kim Turner",
  "kgc8z": "Katie Grace Coleman",
  "kkt8c": "Kerra K Thurston",
  "klk6xsg": "Kasey Leigh Kiefer",
  "kln8n": "Kristine L Nelson",
  "lla2av": "Shawn Anderson",
  "maa3ba": "Margaret A Anderson",
  "maj7ub": "Hannah Crosby",
  "man3hr": "Mark Andrew Nelson",
  "mbz2ke": "Dylan Nicholls",
  "mch8ha": "Martha Caroline Hullman",
  "mfj8tf": "Kara Ross",
  "ne2y": "Nikitha Edunuri",
  "nwz5mg": "Jennifer Fraticelli",
  "qrf6mb": "James Galvin",
  "sh3bz": "Sally Hudson",
  "sth4n": "Steven T Hiss",
  "tav9rs": "Nicki Deuel",
  "tkw9un": "Jason B Bell",
  "tyl7jhm": "Tina Yi Lin",
  "tyz3ay": "Jennett V Murphy",
  "uhc7yk": "Sarah Hanks",
  "waj2bu": "Zane Austin Moore",
  "wmo4b": "Mark Outten",
  "wzr6ys": "Colin Van Buren Achilles",
  "yvq4ez": "Gianpaolo Francesco Licata",
  "yzm8ug": "Sean Michael Flattery",
  "zbe8kz": "Allie Waldron",
  "zpp4hd": "Regina Ford"
};

/**
 * Get staff member's full name from their computing ID
 * @param uid Computing ID (e.g., "bh4hb")
 * @returns Full name or null if not found
 */
export function getStaffName(uid: string): string | null {
  return STAFF_DIRECTORY[uid.toLowerCase()] || null;
}

/**
 * Extract computing ID from email address
 * @param email Email address (e.g., "bh4hb@virginia.edu")
 * @returns Computing ID or null if invalid format
 */
export function extractUidFromEmail(email: string): string | null {
  if (!email || !email.includes('@')) return null;
  return email.split('@')[0].toLowerCase();
}

/**
 * Get staff member's name from email or computing ID
 * @param identifier Email address or computing ID
 * @returns Full name or null if not found
 */
export function lookupStaffMember(identifier: string): string | null {
  if (!identifier) return null;

  // If it's an email, extract the UID
  const uid = identifier.includes('@')
    ? extractUidFromEmail(identifier)
    : identifier.toLowerCase();

  if (!uid) return null;

  return getStaffName(uid);
}
