export interface StaffMember {
  name: string;
  position: string;
  biography: string;
  firstName: string;
  lastName: string;
  phone?: string;
  building?: string;
  officeNumber?: string;
  photoFilename?: string; // Optional custom photo filename (without extension)
}

export const staffDirectory: StaffMember[] = [
  {
    name: "Achilles, Colin Van Buren",
    position: "Associate Director, Center for Effective Lawmaking",
    biography: "Colin Achilles is the Associate Director of the Center for Effective Lawmaking (CEL), a joint partnership between the Batten School and Vanderbilt University. He is the manager of day-to-day operations of CEL. Born and raised in Virginia, Achilles completed his undergraduate work at Flagler College in Political Science and his graduate work at the Graduate School of Political Management at The George Washington University. Prior to coming to UVA, Achilles worked at the Committee for a Responsible Federal Budget, with a focus on the organization's FixUS initiative. He has also interned and volunteered for the federal and state legislatures as well as other nonprofit groups. He is based in Arlington with occasional travel to Grounds.",
    firstName: "Colin",
    lastName: "Achilles",
    phone: "434-243-7180",
    building: "Garrett Hall – Lower Level",
    officeNumber: "L028",
    photoFilename: "Achiles"
  },
  {
    name: "Anderson, Shawn",
    position: "Associate Director of Student Services & Community Engagement",
    biography: "As Associate Director of Student Services and Community Engagement, Anderson advises undergraduate and graduate students in their co-curricular and service-related endeavors, and also organizes school-wide student programming, including wellness related events and graduation. Prior to joining Batten, Anderson wore multiple hats at Piedmont Virginia Community College, where he simultaneously served as the school's Director of Student Engagement and Student Life, as well as Interim Director of Dual Enrollment. He served as the Chair of the Student Services committee, where he collaborated with students, faculty, staff, and administration on the development of the student college experience. With an extensive background in student engagement, first year experience, and recreational sports, Anderson also has experience assisting students with identity development, as well as establishing and maintaining a healthy lifestyle. Anderson earned his bachelor's degree in Liberal Studies at Longwood University, a master's degree in Higher Education and Student Affairs at the University of Virginia and is currently working towards a doctorate in Higher Education Administration at the University of Virginia, where his key focus is student development. In his free time, Anderson enjoys spending time with his family and friends, being outdoors with his dog, Banjo, playing basketball, and watching movies.",
    firstName: "Shawn",
    lastName: "Anderson",
    building: "Garrett Hall – Lower Level",
    officeNumber: "L002A"
  },
  {
    name: "Austin, Maura",
    position: "Postdoctoral Research Associate",
    biography: "Maura Austin is a postdoctoral researcher at the Frank Batten School of Leadership and Public Policy. She studies person perception, motivation, social judgment and decision making, and moral character judgment. Recent projects have focused on the cognitive processes that underlie how people think about moral character growth and how people make decisions about whether a transgressor deserves a second chance. In other work, Maura has focused on the social dynamics of gossip, competitive relationships, and collective long term goal pursuit.",
    firstName: "Maura",
    lastName: "Austin",
    photoFilename: "Austin"
  },
  {
    name: "Baumeister, Natalie Paige",
    position: "Lab Manager, JADE and SoBaD Labs",
    biography: "Natalie Baumeister is the Lab Manager for the Judgments and Decisions Experimental (JADE) Lab and the Social Behavior and Decisions (SoBaD) Lab in the Frank Batten School of Leadership and Public Policy. She earned her B.A.s in Psychology and Cognitive Science from the University of Virginia. She is interested in how and when we use cognitive heuristics, as well as the psychological causes and effects of social inequalities.",
    firstName: "Natalie",
    lastName: "Baumeister"
  },
  {
    name: "Brown, Xanni",
    position: "Postdoctoral Research Associate",
    biography: "Xanni Brown is a postdoctoral fellow at the Frank Batten School of Leadership and Public Policy at the University of Virginia. She is a social and political psychologist studying hierarchy, inequality, and democracy in the U.S., with a focus on how people react to shifting demographics in various contexts. Currently, she is particularly focused on the relationship between demographic change and backlash against democratic institutions. She also studies how to confront bias effectively in a variety of contexts, including schools and workplaces. Brown received her PhD in social psychology from Yale University and was recently a postdoctoral fellow at the University of Pennsylvania.",
    firstName: "Xanni",
    lastName: "Brown"
  },
  {
    name: "Carter Mulligan, Anne Mitchell",
    position: "Senior Director of Admissions",
    biography: "Anne Carter Mulligan joined Batten in January 2019 as Director of Undergraduate Admissions. She's held multiple roles in higher education, most recently as Director of Strategic Initiatives in Enrollment Management at Longwood University, where she led projects designed to enrich the student experience and provide a seamless path from recruitment to graduation. Prior to her time at Longwood, Anne spent more than a decade at the University of Virginia's Miller Center, beginning in 2006 as a research associate before ultimately becoming Director of Support Services and Corporate Secretary to its governing board. She is a 2012 recipient of the Leonard W. Sandridge Outstanding Contribution Award, the highest honor staff receive for their dedicated service to the University. An enthusiastic collector of degrees from Virginia institutions, Anne has a B.A. in English from Virginia Tech, an M.A. in Modern European History from George Mason University, and a M.Ed. in Higher Education Administration from the Education School at UVA.",
    firstName: "Anne",
    lastName: "Carter Mulligan",
    phone: "434-982-0685",
    building: "Garrett Hall – Second Floor",
    officeNumber: "204",
    photoFilename: "Mulligan"
  },
  {
    name: "Cathro, James",
    position: "Director of Finance and Business Services",
    biography: "James is the Director of Finance and Business Services at the Frank Batten School of Leadership and Public Policy. A 2005 US Naval Academy graduate and 2016 Batten School alumnus, James initially worked in UVA's Office of Financial Planning and Analysis after earning his Master of Public Policy. He happily returned to Batten as the Assistant Director of Budget and Finance in 2018. In his current role, James works through a diverse array of interesting challenges, helping facilitate everything from financial reporting to research administration to human resources actions. He also serves as a Commander in the Naval Reserve and was formerly an active-duty Explosive Ordnance Disposal Officer in the US Navy.",
    firstName: "James",
    lastName: "Cathro",
    phone: "434-982-6761"
  },
  {
    name: "Chidester, Jeff L",
    position: "Executive Director of External Affairs",
    biography: "Jeff Chidester is the Executive Director of External Affairs, where he oversees recruitment into the Batten School's academic and lifelong learning programs. From 2003 to 2016, he held various posts at the University of Virginia's Miller Center, most recently as Director of Policy, where he managed the Center's First Year: POTUS 2017 project, as well as a series of national policy debates which aired on ABC News and PBS. He received a B.A. in Political Science from Grove City College (Pa.), an M.A. in International History from the London School of Economics, an M.A. in Politics from the University of Virginia, and an M.B.A. from the University of Massachusetts-Amherst. He is the co-author of The Reagan Years (2005) and At Reagan's Side (Rowman & Littlefield, 2009), and co-editor of Reagan in a World Transformed, 1981-2014 (Harvard University Press, 2014) and Crucible: The President's First Year (UVA Press, 2018). He has published numerous articles on the American presidency and public policy.",
    firstName: "Jeff",
    lastName: "Chidester",
    phone: "434-982-0685",
    building: "Garrett Hall – Second Floor",
    officeNumber: "200B"
  },
  {
    name: "Crombie, Amanda Joan",
    position: "Senior Assistant Dean for Students and Academic Programs",
    biography: "Amanda Crombie is the Batten School's Senior Assistant Dean for Students and Academic Programs. Amanda and her teams support the operational aspects of our academic programming and overall student experience from matriculation and orientation through graduation. Originally from Florida, Amanda completed her undergraduate work at Florida State University in Environmental Science before coming to Virginia to work and study at the University. Amanda holds a Master of Urban and Environmental Planning degree from the Architecture School here at UVA. Crombie is passionate about how environmental degradation and habitat destruction effect biodiversity, and decreasing the negative effects of human activity on the environment. Prior to coming to the Batten School six years ago, she worked for 11 years with the Department of Intramural Recreational Sports here on Grounds serving faculty, staff and students in various roles promoting healthy lifestyles. Amanda and her husband Jack have two children, Jack Jr. and Jensen.",
    firstName: "Amanda",
    lastName: "Crombie",
    phone: "434-243-9976",
    building: "Garrett Hall – Lower Level",
    officeNumber: "L052"
  },
  {
    name: "Davis, Alec",
    position: "Lab Manager, CHIP and Motivation Science Labs",
    biography: "Alec Davis is the Lab Manager for the Culture, History, Identity, and Policy Lab and the Social Motivation Lab in the Frank Batten School of Leadership and Public Policy. He achieved a B.S. in Psychology with certificates in Athletic Healthcare and Disability Rights & Services where he also earned a varsity letter as a member of the Men's Rowing team. He plans on attending graduate school for Social Psychology, with a research focus on disparities related to identity and navigating multiple identities.",
    firstName: "Alec",
    lastName: "Davis",
    photoFilename: "davis"
  },
  {
    name: "Davis, Timothy Leland",
    position: "Associate Professor of Leadership and Public Policy",
    biography: "Tim Davis is associate professor of leadership and public policy at the Frank Batten School of Leadership and Public Policy. A clinical psychologist, Davis helps students, executives and teams achieve more by building resiliency, community and self-awareness. At Batten, he teaches courses on team leadership, group dynamics and emotional resilience. Davis's leadership courses at Batten emphasize practical, experiential learning to build self-awareness. His students form teams to experiment with using different approaches to solving problems they experience as team members and leaders. His resilience-focused courses use the transition to and from college as a place for students to learn emotional resilience skills, life management skills, and foundational leadership skills that will help them deal with setbacks and career changes. He has also delivered keynote talks for a wide range of audiences. He given talks at companies like Hewlett Packard Enterprises as well as at government organizations such as the National Defense Intelligence Agency and the city of Virginia Beach. Davis provides coaching to executives and groups facing moments of intense transition or organizational challenges. He has coached teams and leaders at multinational trade and industry groups, as well as local non-profits, for-profit start-ups and entrepreneurs. He has also helped company boards of directors operate more efficiently and cohesively. Prior to joining Batten, Davis served as the Executive Director for Resilience & Leadership Development at the University of Virginia. He also previously served as the Director of the UVA Center for Counseling & Psychological Services and as Director of Clinical Services at the University of Michigan Counseling & Psychological Services Department. Davis has authored and co-authored book chapters and articles on resilience-related topics. He received the Outstanding Adjunct Faculty Award from the College of Education at Indiana University. He earned his doctorate from the University of Maryland, College Park and his master's from Arizona State University. He received his Executive Coaching Certification from Georgetown University's Institute for Transformational Leadership. Davis completed a postgraduate program in Organizational Development at the Gestalt Institute (Columbus, OH). He was on staff as a consultant with Business of People, an independent consulting firm. Prior to his career as a psychologist, Davis held a variety of marketing and research positions with The Procter & Gamble Company.",
    firstName: "Timothy",
    lastName: "Davis",
    building: "Garrett Hall – Lower Level",
    officeNumber: "L020C",
    photoFilename: "Davis_Tim"
  },
  {
    name: "Downs, Heather L.",
    position: "Director of Academic Operations",
    biography: "Heather Downs joined Batten in December 2023 as the Director of Academic Operations. She has served UVA Athletics since 2013, most recently as the Executive Director of Student Development. In this role she led a student development team dedicated to academic advising, learning support, career and personal development, and community engagement. She came to UVA with a background in student support and program management across multiple functional areas in higher education, including student retention, advising, leadership development, and residence life. She served in the Office of Student Life at UC Berkeley (2003-2005), managing the development and implementation of campus leadership programs. Prior to that she worked at the University of Northern Colorado (2000-2002) as the facilitator of academic advising, specifically with first-generation and low-income students. She earned a bachelor of science degree in environmental engineering from the University of Florida and a master's degree in student affairs and higher education from Colorado State University. In her current role, Heather is responsible for the daily operations of the Batten School academic support services for students in our degree programs. She will support Batten faculty and our student teaching staff through advising, course execution, and the enrichment of the academic experience for all Batten students.",
    firstName: "Heather",
    lastName: "Downs",
    phone: "434-924-6035",
    building: "Garrett Hall – Lower Level",
    officeNumber: "L050"
  },
  {
    name: "Edunuri, Nikitha",
    position: "Salesforce Application Manager",
    biography: "Nikitha Edunuri serves as the Salesforce Application Manager for the University of Virginia's Frank Batten School, specializing in implementing, customizing, and supporting the Salesforce CRM platform to meet Batten's administrative and engagement needs. Her work enables efficient data management, user support, and integration within UVA's broader systems.",
    firstName: "Nikitha",
    lastName: "Edunuri"
  },
  {
    name: "Flattery, Sean Michael",
    position: "Assistant Director of Events and Operations",
    biography: "As assistant director of events and operations, Sean Michael supports the Batten School's mission by ensuring the efficient planning and execution of key events and daily operations. Before joining Batten, he was assistant technical director at the Barter Theatre in Abingdon, Va., where he worked closely with directors, designers, carpenters and crew to transform creative visions into seamless live performances. He has toured nationally as an actor and deck manager, coordinating performances and technical operations in over 100 venues across 36 states, Toronto and off-Broadway. Sean Michael earned a Bachelor of Arts in Philosophy from the University of Virginia, graduating Phi Beta Kappa with distinction in three years. Currently pursuing a Master of Science in Nonprofit Administration at Louisiana State University (online), he is passionate about building efficient systems that empower mission-based organizations to amplify their impact and realize their vision. In his free time, he enjoys exploring Virginia's scenic landscapes, delving into culinary adventures, and exploring historic sites with his fiancé and their dog, Sybil.",
    firstName: "Sean Michael",
    lastName: "Flattery",
    building: "Garrett Hall – Lower Level",
    officeNumber: "L020A"
  },
  {
    name: "Ford, Regina",
    position: "Business Services Specialist",
    biography: "Regina Ford is the Business Services Specialist for the Batten School and supports multiple areas of our Finance and Business Services team. She has extensive knowledge and experience as a fitness professional in health and wellness ranging from management to multi-faceted trainer and instructor. She also has more than 17 years of experience in the trade show industry. She earned her bachelor's degree in social work from Shippensburg University with a minor in psychology and art.",
    firstName: "Regina",
    lastName: "Ford",
    photoFilename: "ford"
  },
  {
    name: "Hadijski, George",
    position: "Program Associate, Center for Effective Lawmaking",
    biography: "George Hadijski is the Senior Program Associate at the Center for Effective Lawmaking (CEL), a joint partnership between the Batten School and Vanderbilt University. He is responsible for increasing the use of CEL's research by lawmakers, their staffs, and their influencers. Prior to CEL, George worked at the Congressional Management Foundation, where he was responsible for the oversight and management of CMF's training and management consulting services provided to US House and Senate offices, the joint legislative operations training program conducted in coordination with the Government Affairs Institute at Georgetown University, key roles in CMF's annual Democracy Awards, and individual congressional office consultations. George worked at the US House of Representatives for 27 years. He spent most of his career at the Committee on House Administration serving six different Committee Chairs. George served as the Committee's Director of Member and Committee Services and concluded his work on Capitol Hill as a Senior Advisor. In his capacity with the Committee, George was the key advisor at the US House on rules and regulations pertaining to official resources. George provided direct guidance to Committee Chairs, Members and staff of the House leadership, committees, congressional offices, and officers of the House. George also provided briefings to House Members and staff, was responsible for the annual budget authorizations for Members' congressional and committee offices, advised on communications/Use of the Congressional Frank, was heavily involved in the operational planning in the wake of the events on 9/11 and Anthrax attacks at the House of Representatives, and was lead staff for putting together the Orientation Educational Program for newly elected members of the US House of Representatives. Among George's past work on the Committee, he had oversight responsibilities for the Library of Congress, Smithsonian Institution, and Architect of the Capitol. His accomplishments include playing various roles in the transition and reform of the House in 1995 and again in 2011, drafting the Members' Congressional Handbook, Committee Congressional Handbook, and the Guide to Outfitting an Office. He also completed staff level work to shepherd passage of the National Museum of African-American History and Culture, authorize passage of Smithsonian Board of Regents nominees, authorize Smithsonian research facilities, conduct investigative oversight hearings on the National Zoo, participated in preliminary work and planning on the Capitol Visitor Center, and advised visiting foreign government officials on operations of the US House within the Committee's jurisdiction.",
    firstName: "George",
    lastName: "Hadijski"
  },
  {
    name: "Hanks, Sarah",
    position: "Director of Career Services",
    biography: "Sarah Hanks is the Director of Career Services for the Frank Batten School. She has more than 15 years of experience in nonprofit capacity building, change management, and crisis recovery. With a Ph.D. in leadership studies and nonprofit governance, Sarah has applied theory to practice in an effort to advance innovation in program development, generative governance, and capacity building, employing best practices to create lasting change for individuals, families, and communities.",
    firstName: "Sarah",
    lastName: "Hanks"
  },
  {
    name: "Hartless, Ben",
    position: "Assistant Director of Information Technology",
    biography: "Ben is the Assistant Director of Information Technology at the Batten School. Ben was born and raised an hour away in Lexington, Virginia where he worked at Washington and Lee University for 13 years as a Technology Support Specialist. He also worked seven years at the Washington and Lee School of Law as the Director of Information Technology before beginning his new career at the Batten School in spring of 2020.",
    firstName: "Ben",
    lastName: "Hartless",
    phone: "1-540-460-7676",
    building: "Garrett Hall – First Floor",
    officeNumber: "104"
  },
  {
    name: "Henry, Andrea Marie",
    position: "Events Manager",
    biography: "Andrea Henry is an experienced professional fulfilling the role as our Events Manager. A University of Virginia alumna, class of 2019, with a dual degree in Art History and Sociology, her educational and professional journey from UVA and post-graduation provided a solid foundation in strategic planning and effective communication, all of which contribute to her expertise in event management. In her spare time, she indulges in HBO shows or tries new restaurants and cafes around town.",
    firstName: "Andrea",
    lastName: "Henry",
    building: "Garrett Hall – Lower Level",
    officeNumber: "L020A"
  },
  {
    name: "Holmsted, Jon",
    position: "Director of Development",
    biography: "Jon joins the Batten School from the Virginia Athletics Foundation where he has served for two years, most recently as Director of Major Gifts. While at VAF, Jon oversaw fundraising for the Kevin Sauer endowments supporting Men's and Women's Rowing, which have combined to eclipse over $2 Million in commitments since the project's launch in early 2023. Jon was also instrumental in establishing the Baseball Coaches Club, which has raised nearly $250k per year in future commitments by offering elevated stewardship to multi-year donors. Prior to joining VAF, Jon was an Associate Director of Development for the College Foundation of the University of Virginia. During his time in the College, Jon oversaw three volunteer fundraising boards, led fundraising for the unrestricted College Fund, and assumed major gift responsibility on a regional basis. Alongside six and a half years of development experience within the University, Jon also brings six years of experience in political campaigns, political fundraising, and institutional grant seeking. Jon is a 2010 graduate of the University (Government, Economics) and lives in Charlottesville with his wife, Maddie – who is a proud Double 'Hoo (BSN '16, MSN-PNP '23). When he is away from his work, you can expect to find Jon at the gym, listening to a podcast, or catching up on binge-worthy TV with Maddie and Avon – their exceedingly friendly tortoiseshell cat.",
    firstName: "Jon",
    lastName: "Holmsted",
    photoFilename: "Holmsted"
  },
  {
    name: "Licata, Gianpaolo Francesco",
    position: "Associate Director of Academic Operations",
    biography: "Gianpaolo Licata is the Associate Director of Academic Operations at the Frank Batten School of Leadership and Public Policy at the University of Virginia. Gianpaolo recently joined the Batten School after his work in student success, academic advising, and student-athlete support at Hartwick College, UVA, and Virginia Commonwealth University. He completed his undergraduate degree in History at the University of California, Santa Barbara, and received his Master of Education in Curriculum and Instruction from King's College. He is especially intrigued by the effects of collective trauma on human development and the educational interventions that can help mitigate it. Gianpaolo recently welcomed his first child with his partner Emma. They enjoy making a home out in the nearby country with their pups Levi, Lincoln, and Leroy.",
    firstName: "Gianpaolo",
    lastName: "Licata",
    building: "Garrett Hall – Lower Level",
    officeNumber: "L044"
  },
  {
    name: "Lin, Tina Yi",
    position: "Associate Director, Center for Social Innovation",
    biography: "Tina Lin is the Associate Director for the Center for Social Innovation in the Frank Batten School of Leadership and Public Policy at the University of Virginia. She earned her B.A. in Psychology and a minor in Data Science from the University of Virginia. She is interested in how climate change impacts developing nations and the innovative solutions to counter the adverse effects.",
    firstName: "Tina",
    lastName: "Lin",
    building: "Chancellor Apartments",
    officeNumber: "206"
  },
  {
    name: "Lindqvist, Craig Selwyn",
    position: "Associate Dean for Administration",
    biography: "Craig Lindqvist serves as the Associate Dean for Administration at the Batten School where he oversees the school's business affairs, planning, finances, personnel, technology, facilities, and other non-academic functions. Prior to joining the Batten School in 2020, he served in a variety of senior leadership roles at CFA Institute where he led global functions including strategic planning, global business operations, market intelligence and business analytics, financial planning & analysis, technology development and operations, and other business services. He began his professional career as an avionics engineer for The Boeing Company before serving in the U.S. Navy as a supply corps officer, where he developed practical experience in leadership, financial management, personnel administration, and supply chain logistics. He went on to receive a master's degree in business administration with a concentration in finance and operations management from the University of Colorado at Boulder. In 2010, he completed the Accelerated Master's Program for Systems Engineering at the University of Virginia.",
    firstName: "Craig",
    lastName: "Lindqvist",
    building: "Garrett Hall – Second Floor",
    officeNumber: "200B"
  },
  {
    name: "Ludovici, Jennifer Lynne",
    position: "Director of Operations for National Security Initiatives",
    biography: "Jennifer Ludovici is the NSPC Director of Operations & Research Initiatives. She has over 18 years of experience in higher education administration in both the public and private sector. In her role at the NSPC, she focuses on faculty research collaboration, project coordination and program development as well as general operations and communications. Jennifer holds a post-graduate certificate in project management from UVA, and a BA/MEd in history and education from James Madison University.",
    firstName: "Jennifer",
    lastName: "Ludovici",
    phone: "804 564-5021"
  },
  {
    name: "Marsh, Brandy A",
    position: "Business Services Manager",
    biography: "Brandy Marsh is the Business Services Manager for the Frank Batten School. She joined Batten in 2020, bringing her administrative experience in various UVA and commercial roles to the team. Brandy specializes in all aspects of Workday financials and grant management. She's the proud parent of five awesome children and a lifelong resident of the Charlottesville area.",
    firstName: "Brandy",
    lastName: "Marsh",
    phone: "434 996-2643"
  },
  {
    name: "Moore, Cindy",
    position: "Assistant Director of Accounting",
    biography: "Cindy Moore is an integral member of the Batten School's administration. As Assistant Director of Accounting, she provides foundational support for the School's fiscal operations—enabling smooth program delivery and institutional accountability. For inquiries related to budgets, financial records, or accounting procedures within the Batten School, she is the primary contact.",
    firstName: "Cindy",
    lastName: "Moore"
  },
  {
    name: "Murphy, Jennett V",
    position: "Assistant Director of Faculty Affairs",
    biography: "Jennett Murphy is the Assistant Director of Faculty Affairs at the Batten School; she supports and manages processes to advance the success of the faculty. Murphy is responsible for processes involving faculty recruitment and academic appointments, among others, and facilitating professional development events and supporting faculty governance. Originally from upstate New York, Murphy completed her Masters in Library and Information Science at Simmons University and enjoys using her skills in data and file management with the Batten Academic Affairs team.",
    firstName: "Jennett",
    lastName: "Murphy",
    building: "Garrett Hall – Lower Level",
    officeNumber: "L042"
  },
  {
    name: "Nelson, Kristine",
    position: "Associate Director of Academic Operations",
    biography: "Kristine Nelson is an Associate Director of Academic Operations at the Frank Batten School of Leadership and Public Policy. Prior to joining the Batten School in 2017, Kristine worked for four years at the School of Architecture as the Director of Graduate Admissions. Kristine has a B.B.A. from the College of William and Mary and an M.Ed. from the University of Georgia. Her work in higher education began in Residence Life at the College of Charleston in South Carolina. Kristine is the academic advisor for all undergraduate Batten majors and minors as well as the first point of contact for International MPP students at the Batten School. Inspired by the mission of the Batten school as well as by the outreach and activism of the Batten students, Kristine has supported local campaigns, worked at the polls on election day, mentored adults seeking living wage employment, and supports holistic community development programs like Abundant Life Ministries. Kristine and her husband, Louis, have three children (two 'hoos and one VCU Ram), as well as several chickens and ducks.",
    firstName: "Kristine",
    lastName: "Nelson",
    photoFilename: "Nelson_Kristine"
  },
  {
    name: "Nelson, Mark Andrew",
    position: "Advancement Associate",
    biography: "Mark Nelson is an advancement associate at the Frank Batten School of Leadership and Public Policy. A native of the Shenandoah Valley, he graduated from the University of Virginia and spent a decade working in nonprofits and real estate. At the Batten School, Mark provides broad administrative support to the development team and is proud to assist with fulfilling Batten's mission.",
    firstName: "Mark",
    lastName: "Nelson",
    phone: "434-982-2094",
    photoFilename: "Nelson"
  },
  {
    name: "Outten, Mark",
    position: "Director of Information Technology and School Systems",
    biography: "Mark was most recently the Director of Technology for the Orange County Public Schools in Orange, VA, has over 20 years of education-related technology leadership and management experience, worked in private industry for a Hewitt Associates, and is a veteran of the U.S. Air Force. He brings a wealth of strategic and practical education technology experience to Batten.",
    firstName: "Mark",
    lastName: "Outten",
    officeNumber: "104"
  },
  {
    name: "Porto, Nicolo William",
    position: "CAPS Therapist",
    biography: "Nicolo Porto is a Licensed Clinical Social Worker. He graduated from Marquette University in 2014 with a B.A. in Psychology and Sociology. He graduated from George Mason University in 2016 with his Master of Social Work, Clinical Concentration. He has a certificate in Sports Social Work from the Alliance of Social Workers in Sports (ASWIS). Nicolo has been a psychotherapist at UVA CAPS since July 2022. Clinical interests include: depression, anxiety, self-esteem, relationships, executive functioning, and life transitions. Nicolo is a member of the Gender-Affirming Care Treatment Team in Student Health and Wellness. Outside of work, Nicolo enjoys spending time with his wife, dogs, going to trivia, playing softball, and is an avid sports fan.",
    firstName: "Nicolo",
    lastName: "Porto",
    phone: "434-243-5150",
    building: "Garrett Hall – Lower Level",
    officeNumber: "L001"
  },
  {
    name: "Ramoutar, Navin",
    position: "Associate Director of Development",
    biography: "Navin is a results-driven professional with a robust background in marketing and fundraising. With notable tenures at Vanderbilt University and Heineken, Navin has honed his skills in building meaningful partnerships, and contributing to the overall success of diverse projects. On weekends, you can find Navin coaching youth soccer, and enjoying moments with friends and family.",
    firstName: "Navin",
    lastName: "Ramoutar",
    photoFilename: "Ramoutar"
  },
  {
    name: "Reinicke, Carey",
    position: "Assistant Director of Grants and Contracts",
    biography: "Carey Reinicke is the Assistant Director of Grants and Contracts within the Batten Finance unit, focusing on the management of the school's sponsored awards and related processes. She received a B.S. in Psychology from Virginia Tech in 2002 and obtained her Certified Research Administrator (CRA) credential in 2016. With over twelve years in research administration roles at UVA, Carey serves as the Batten liaison among various university and professional groups.",
    firstName: "Carey",
    lastName: "Reinicke"
  },
  {
    name: "Robinson, John",
    position: "Photo and Video Manager",
    biography: "John Robinson manages photo and video content for the Batten School. He brings 15 years of professional photo and video experience from projects all over the world, including eight years working with Batten as a contractor. John has a passion for visual storytelling and collaborating with wonderful people. A native of Montpelier, Vermont, he has been based in Charlottesville for over a decade. He and his wife have two children. An avid traveler, he aims to visit every state in the country (currently 35 out of 50) and every continent (currently 3 out of 7). When he is not behind the lens, you can find him in his garden, reading a good book, or carving a new project out of wood.",
    firstName: "John",
    lastName: "Robinson",
    building: "Garrett Hall – Lower Level",
    officeNumber: "L020A",
    photoFilename: "Robinson_John_M"
  },
  {
    name: "Robinson, John",
    position: "NSPC Director of Academic Programs",
    biography: "John Robinson is the NSPC's Director of Academic Programs. He teaches undergraduate and graduate courses focused on national security, including Innovating for Defense, an experiential course that pairs student teams with sponsors from the Department of Defense (DoD) to solve real-world national security problems. His research interests include international security and naval affairs. John holds a Ph.D. in Politics from the University of Virginia, and a M.A. from the U.S. Naval War College.",
    firstName: "John",
    lastName: "Robinson",
    photoFilename: "Robinson_John"
  },
  {
    name: "Rockwell, Jill S",
    position: "Senior Assistant Dean of Career Advancement and Alumni Engagement",
    biography: "Jill Rockwell, Senior Assistant Dean of Career Advancement and Alumni Engagement, and her team are focused on the professional success of our graduates and alumni as well as activating our alumni network in support of the school. Before joining the Batten School in 2008, Rockwell spent nearly a decade working at Duke Law School, both in career advising and as the law school's Associate Dean of Students. Prior to these positions, she practiced employment law at the Chicago office of Littler Mendelson and served as the Director of Career Advising and co-director of publications at the University of Illinois College of Law. She earned her JD, cum laude, from the University of Illinois, and her BA in journalism and political science at Indiana University.",
    firstName: "Jill",
    lastName: "Rockwell",
    phone: "434-924-7950",
    building: "Garrett Hall – Second Floor",
    officeNumber: "203"
  },
  {
    name: "Ross, Kara",
    position: "Research Lab Coordinator",
    biography: "Kara Ross is the Research Lab Coordinator at the Frank Batten School of Leadership and Public Policy, where she manages day-to-day operations in the School's behavioral and experimental research lab and supports multiple faculty members with their research needs. Ross worked in human resources at a government contracting agency for three years before joining Batten to better align her work with her interest in eventual further study in psychology. A 2020 graduate of James Madison University, Kara holds a BS in Psychology with double minor in Human Resource Development and Public Policy & Administration.",
    firstName: "Kara",
    lastName: "Ross"
  },
  {
    name: "Tappe, Elinor (Ellie)",
    position: "Executive Director of Strategic Advancement",
    biography: "Elinor Tappé serves as Executive Director of Strategic Advancement where she helps shape and realize the strategic objectives of the Batten School. With a 25-year history in strategic planning and development, Elinor has held a variety of leadership roles in the corporate sector, as well as higher education and nonprofit. Her experience in philanthropy spans more than a decade and includes UC Berkeley, Larkin Street Youth Services and Urban Teachers. By leveraging her unique background, Elinor designs entrepreneurial initiatives that drive philanthropic support from both institutional and individual donors. She's recruited and coached high-performing teams on a regional and national level and continues to mentor development professionals across the country. Elinor serves on several Boards and is active in the Charlottesville community.",
    firstName: "Elinor",
    lastName: "Tappe",
    photoFilename: "Tappé"
  },
  {
    name: "Thurston, Kerra K",
    position: "Executive Assistant to the Dean",
    biography: "Kerra Thurston is the Executive Assistant to the Dean at the Frank Batten School of Leadership and Public Policy.",
    firstName: "Kerra",
    lastName: "Thurston",
    phone: "434-924-0828",
    building: "Garrett Hall – Second Floor",
    officeNumber: "200"
  },
  {
    name: "Turner, Kim",
    position: "Assistant Director of Financial Planning and Analysis",
    biography: "Kim Turner is the Assistant Director of Financial Planning and Analysis at the Frank Batten School of Leadership and Public Policy. Kim joined Batten in 2025 after a decade serving as the Finance and Administration Manager for UVA Music in the College of Arts & Sciences. In her current role, Kim focuses on the annual budget, financial reporting, and various other financial functions. An alumna of the University of Virginia, Kim holds a Bachelor of Arts in Spanish. Committed to continuous growth, she went on to earn both an MBA and an MS in Public Relations from the University of Maryland University College. Though not a Charlottesville native, Kim has cultivated deep roots in the area since her early days at UVA, affectionately embracing it as home. In her leisure moments, she finds joy in exploring the world through travel, enjoying live music, baking, volunteering, and spending time with family and friends.",
    firstName: "Kim",
    lastName: "Turner"
  },
  {
    name: "Whelchel, Jeffrey Wayne",
    position: "IT Coordinator",
    biography: "Jeffrey Whelchel holds the position of IT Coordinator at Batten, where he oversees information technology operations. With a diverse background in the field, Jeffrey has amassed extensive experience in various IT capacities, notably serving as a Senior Programmer Analyst at Accenture and as an Enterprise Systems Administrator at Cingular Wireless. His academic qualifications include a Bachelor of Science degree from the University of Georgia, complemented by coursework at Georgia State University, DeVry Institute of Technology, the Chubb Institute, Dekalb College, and PVCC. Beyond his involvement in IT, Jeffrey has also engaged in different professional pursuits. Notably, he has shared his expertise as a high school teacher, gained practical experience as a passenger bus driver, and even showcased his comedic talents at the renowned Punchline venue.",
    firstName: "Jeffrey",
    lastName: "Whelchel",
    building: "Garrett Hall – Lower Level",
    officeNumber: "L056"
  },
  {
    name: "Workman, Dakota Lee",
    position: "Operations Manager",
    biography: "Dakota Workman is a dedicated professional serving as the Events and Operations Coordinator at the Batten School, leveraging his expertise in daily operations and event management. Joining the University of Virginia (UVA) in 2016, Dakota initially excelled in managing Aquatics and Facilities within the Intramural Recreation Sports department. With degrees in Business Administration from Garrett College and Exercise Sports Science from Frostburg State University, Dakota brings a well-rounded skill set to his role. While embracing a diverse range of activities, Dakota's genuine passion lies in golf, which remains his ultimate pastime.",
    firstName: "Dakota",
    lastName: "Workman",
    building: "Garrett Hall – Lower Level",
    officeNumber: "L056",
    photoFilename: "Workman"
  }
];
