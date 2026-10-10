import type { Citation, Credit, Source } from './sources'

/*
 * Generated from the research pass, then edited by hand — edit freely. Every
 * source here was opened and read against the sentence it is anchored to;
 * anything that could not be confirmed was left out rather than cited on
 * trust. `npm run check:refs` fails if an anchor stops matching the copy.
 */

export const sources: Record<string, Source> = {
  "chip-1": {
    "title": "Intel Core i9-13900K Processor (36M Cache, up to 5.80 GHz) - Specifications",
    "url": "https://www.intel.com/content/www/us/en/products/sku/230496/intel-core-i913900k-processor-36m-cache-up-to-5-80-ghz/specifications.html",
    "kind": "datasheet",
    "authors": "Intel Corporation",
    "year": 2022,
    "venue": "Intel ARK product specifications"
  },
  "chip-2": {
    "title": "Intel Xeon Processor Scalable Family Thermal Mechanical Specifications and Design Guide (Ref. 336064-004US)",
    "url": "https://www.intel.com/content/dam/www/public/us/en/documents/guides/xeon-scalable-thermal-guide.pdf",
    "kind": "datasheet",
    "authors": "Intel Corporation",
    "year": 2019,
    "venue": "Intel design guide"
  },
  "chip-3": {
    "title": "Trends in Processor Architecture",
    "url": "https://arxiv.org/abs/1801.05215",
    "kind": "paper",
    "authors": "Antonio Gonzalez",
    "year": 2018,
    "venue": "arXiv:1801.05215"
  },
  "chip-4": {
    "title": "Intel Pentium 4 Processor on 90 nm Process Datasheet (302351/30056103)",
    "url": "https://www.intel.com/content/dam/support/us/en/documents/processors/pentium4/sb/30056103.pdf",
    "kind": "datasheet",
    "authors": "Intel Corporation",
    "year": 2004,
    "venue": "Intel datasheet"
  },
  "chip-5": {
    "title": "LGA775 Socket Mechanical Design Guide (302666)",
    "url": "https://www.intel.com/Assets/PDF/designguide/302666.pdf",
    "kind": "datasheet",
    "authors": "Intel Corporation",
    "year": 2006,
    "venue": "Intel design guide"
  },
  "chip-6": {
    "title": "Apple unveils M3, M3 Pro, and M3 Max, the most advanced chips for a personal computer",
    "url": "https://www.apple.com/newsroom/2023/10/apple-unveils-m3-m3-pro-and-m3-max-the-most-advanced-chips-for-a-personal-computer/",
    "kind": "article",
    "authors": "Apple Newsroom",
    "year": 2023,
    "venue": "Apple press release, 30 Oct 2023"
  },
  "chip-7": {
    "title": "AMD's Zen 4, Part 2: Memory Subsystem and Conclusion",
    "url": "https://chipsandcheese.com/p/amds-zen-4-part-2-memory-subsystem-and-conclusion",
    "kind": "article",
    "authors": "Chester Lam (Chips and Cheese)",
    "year": 2022,
    "venue": "Chips and Cheese"
  },
  "chip-8": {
    "title": "Intel 64 and IA-32 Architectures Optimization Reference Manual, Volume 1 (248966-050US)",
    "url": "https://software.intel.com/content/dam/develop/external/us/en/documents-tps/64-ia-32-architectures-optimization-manual.pdf",
    "kind": "datasheet",
    "authors": "Intel Corporation",
    "year": 2024,
    "venue": "Intel manual"
  },
  "chip-9": {
    "title": "1960: Metal Oxide Semiconductor (MOS) Transistor Demonstrated",
    "url": "https://www.computerhistory.org/siliconengine/metal-oxide-semiconductor-mos-transistor-demonstrated/",
    "kind": "museum",
    "authors": "Computer History Museum",
    "year": 2024,
    "venue": "The Silicon Engine timeline"
  },
  "chip-10": {
    "title": "1947: Invention of the Point-Contact Transistor",
    "url": "https://www.computerhistory.org/siliconengine/invention-of-the-point-contact-transistor/",
    "kind": "museum",
    "authors": "Computer History Museum",
    "year": 2024,
    "venue": "The Silicon Engine timeline"
  },
  "chip-11": {
    "title": "1926: Field Effect Semiconductor Device Concepts Patented",
    "url": "https://www.computerhistory.org/siliconengine/field-effect-semiconductor-device-concepts-patented/",
    "kind": "museum",
    "authors": "Computer History Museum",
    "year": 2024,
    "venue": "The Silicon Engine timeline"
  },
  "chip-12": {
    "title": "The High-k Solution",
    "url": "https://spectrum.ieee.org/the-highk-solution",
    "kind": "article",
    "authors": "Mark T. Bohr, Robert S. Chau, Tahir Ghani, Kaizad Mistry",
    "year": 2007,
    "venue": "IEEE Spectrum 44(10):29-35"
  },
  "chip-13": {
    "title": "Low Stand-By Power Complementary Field Effect Circuitry (US Patent 3,356,858)",
    "url": "https://patents.google.com/patent/US3356858A/en",
    "kind": "patent",
    "authors": "Frank M. Wanlass (Fairchild Camera and Instrument)",
    "year": 1967,
    "venue": "US patent, filed 18 Jun 1963, granted 5 Dec 1967"
  },
  "chip-14": {
    "title": "1963: Complementary MOS Circuit Configuration is Invented",
    "url": "https://www.computerhistory.org/siliconengine/complementary-mos-circuit-configuration-is-invented/",
    "kind": "museum",
    "authors": "Computer History Museum",
    "year": 2024,
    "venue": "The Silicon Engine timeline"
  },
  "chip-15": {
    "title": "Milestones: The Field Programmable Gate Array (FPGA), 1984",
    "url": "https://ethw.org/Milestones:The_Field_Programmable_Gate_Array_(FPGA),_1984",
    "kind": "museum",
    "authors": "IEEE / Engineering and Technology History Wiki",
    "year": 2024,
    "venue": "IEEE Milestone citation"
  },
  "chip-16": {
    "title": "Measuring the Gap between FPGAs and ASICs",
    "url": "https://www.eecg.toronto.edu/~jayar/pubs/kuon/kuonfpga06.pdf",
    "kind": "paper",
    "authors": "Ian Kuon, Jonathan Rose",
    "year": 2006,
    "venue": "ACM/SIGDA FPGA '06, pp. 21-30 (extended version: IEEE TCAD 26(2):203-215, 2007, doi 10.1109/TCAD.2006.884574)"
  },
  "chip-17": {
    "title": "1.1 Computing's energy problem (and what we can do about it)",
    "url": "https://gwern.net/doc/cs/hardware/2014-horowitz-2.pdf",
    "kind": "paper",
    "authors": "Mark Horowitz",
    "year": 2014,
    "venue": "IEEE ISSCC 2014 Digest of Technical Papers, pp. 10-14"
  },
  "chip-18": {
    "title": "CUDA Programming Guide, 3.2 Advanced Kernel Programming (SIMT)",
    "url": "https://docs.nvidia.com/cuda/cuda-programming-guide/03-advanced/advanced-kernel-programming.html",
    "kind": "datasheet",
    "authors": "NVIDIA",
    "year": 2026,
    "venue": "NVIDIA documentation"
  },
  "chip-19": {
    "title": "NVIDIA Tesla V100 GPU Architecture (Volta whitepaper)",
    "url": "https://images.nvidia.com/content/volta-architecture/pdf/volta-architecture-whitepaper.pdf",
    "kind": "datasheet",
    "authors": "NVIDIA",
    "year": 2017,
    "venue": "NVIDIA whitepaper WP-08608-001"
  },
  "chip-20": {
    "title": "Introduction to Cloud TPU",
    "url": "https://docs.cloud.google.com/tpu/docs/intro-to-tpu",
    "kind": "datasheet",
    "authors": "Google Cloud",
    "year": 2026,
    "venue": "Google Cloud documentation"
  },
  "chip-21": {
    "title": "In-Datacenter Performance Analysis of a Tensor Processing Unit",
    "url": "https://arxiv.org/abs/1704.04760",
    "kind": "paper",
    "authors": "Norman P. Jouppi, Cliff Young, Nishant Patil, David Patterson, et al.",
    "year": 2017,
    "venue": "ISCA 2017 (arXiv:1704.04760)"
  },
  "chip-22": {
    "title": "1958: All Semiconductor 'Solid Circuit' is Demonstrated",
    "url": "https://www.computerhistory.org/siliconengine/all-semiconductor-solid-circuit-is-demonstrated/",
    "kind": "museum",
    "authors": "Computer History Museum",
    "year": 2024,
    "venue": "The Silicon Engine timeline"
  },
  "chip-23": {
    "title": "1959: Practical Monolithic Integrated Circuit Concept Patented",
    "url": "https://www.computerhistory.org/siliconengine/practical-monolithic-integrated-circuit-concept-patented/",
    "kind": "museum",
    "authors": "Computer History Museum",
    "year": 2024,
    "venue": "The Silicon Engine timeline"
  },
  "memory-1": {
    "title": "Digital Design & Computer Architecture, Chapter 3: Sequential Logic Design (lecture slides)",
    "url": "https://pages.hmc.edu/harris/class/e85/DDCArv_Ch3.pdf",
    "kind": "course",
    "authors": "Sarah L. Harris, David Harris",
    "venue": "Harvey Mudd College E85 course materials (Elsevier/Morgan Kaufmann textbook companion)"
  },
  "memory-2": {
    "title": "Re-creating the First Flip-Flop",
    "url": "https://spectrum.ieee.org/recreating-the-first-flipflop",
    "kind": "article",
    "authors": "Richard Brewster",
    "year": 2018,
    "venue": "IEEE Spectrum (25 May 2018)"
  },
  "memory-3": {
    "title": "Lecture 19: SRAM (CMOS VLSI Design, 4th ed.)",
    "url": "https://pages.hmc.edu/harris/cmosvlsi/4e/lect/lect19.pdf",
    "kind": "course",
    "authors": "David Harris (after Weste & Harris)",
    "venue": "Harvey Mudd College course slides"
  },
  "memory-4": {
    "title": "Field-effect transistor memory (US Patent 3,387,286)",
    "url": "https://patents.google.com/patent/US3387286A/en",
    "kind": "patent",
    "authors": "Robert H. Dennard (IBM)",
    "year": 1968,
    "venue": "US Patent Office; filed 14 Jul 1967, issued 4 Jun 1968"
  },
  "memory-5": {
    "title": "1970: MOS Dynamic RAM Competes with Magnetic Core Memory on Price",
    "url": "https://www.computerhistory.org/siliconengine/mos-dynamic-ram-competes-with-magnetic-core-memory-on-price/",
    "kind": "museum",
    "authors": "Computer History Museum",
    "venue": "CHM, The Silicon Engine timeline"
  },
  "memory-7": {
    "title": "DRAM Refresh Mechanisms, Penalties, and Trade-Offs",
    "url": "https://user.eng.umd.edu/~blj/papers/ieeetc65-1.pdf",
    "kind": "paper",
    "authors": "Ishwar Bhati, Mu-Tien Chang, Zeshan Chishti, Shih-Lien Lu, Bruce Jacob",
    "year": 2016,
    "venue": "IEEE Transactions on Computers 65(1):108-121"
  },
  "memory-8": {
    "title": "The Memory Wall: Past, Present, and Future of DRAM",
    "url": "https://newsletter.semianalysis.com/p/the-memory-wall",
    "kind": "article",
    "authors": "Dylan Patel et al. (SemiAnalysis)",
    "year": 2024,
    "venue": "SemiAnalysis newsletter (3 Sep 2024)"
  },
  "memory-9": {
    "title": "Slave Memories and Dynamic Storage Allocation",
    "url": "https://www.computerhistory.org/collections/catalog/102693295",
    "kind": "paper",
    "authors": "M. V. Wilkes",
    "year": 1965,
    "venue": "IEEE Transactions on Electronic Computers EC-14(2):270-271"
  },
  "memory-10": {
    "title": "The Locality Principle",
    "url": "https://denninginstitute.com/pjd/PUBS/CACMcols/cacmJul05.pdf",
    "kind": "paper",
    "authors": "Peter J. Denning",
    "year": 2005,
    "venue": "Communications of the ACM 48(7):19-24"
  },
  "memory-11": {
    "title": "Apple M1 (Firestorm/Icestorm) cache and memory latency",
    "url": "https://www.7-cpu.com/cpu/Apple_M1.html",
    "kind": "article",
    "authors": "7-cpu.com (Igor Pavlov)",
    "venue": "7-cpu.com measurement page"
  },
  "memory-12": {
    "title": "A Performance & Power Comparison of Modern High-Speed DRAM Architectures",
    "url": "https://user.eng.umd.edu/~blj/papers/memsys2018-dramsim.pdf",
    "kind": "paper",
    "authors": "Shang Li, Dhiraj Reddy, Bruce Jacob",
    "year": 2018,
    "venue": "MEMSYS 2018, pp. 341-353"
  },
  "memory-14": {
    "title": "Apple unleashes M1",
    "url": "https://www.apple.com/newsroom/2020/11/apple-unleashes-m1/",
    "kind": "article",
    "authors": "Apple Newsroom",
    "year": 2020,
    "venue": "Apple press release (10 Nov 2020)"
  },
  "memory-15": {
    "title": "Where is the data? Why you cannot debate CPU vs. GPU performance without the answer",
    "url": "https://web.stanford.edu/~cgregg/chris-gregg/pubs/WhereIsTheData.pdf",
    "kind": "paper",
    "authors": "Chris Gregg, Kim Hazelwood",
    "year": 2011,
    "venue": "IEEE ISPASS 2011, pp. 134-144"
  },
  "memory-16": {
    "title": "A Floating Gate and Its Application to Memory Devices",
    "url": "https://doi.org/10.1002/j.1538-7305.1967.tb01738.x",
    "kind": "paper",
    "authors": "D. Kahng, S. M. Sze",
    "year": 1967,
    "venue": "Bell System Technical Journal 46(6):1288-1295"
  },
  "memory-17": {
    "title": "A new flash E2PROM cell using triple polysilicon technology",
    "url": "https://doi.org/10.1109/IEDM.1984.190752",
    "kind": "paper",
    "authors": "F. Masuoka, M. Asano, H. Iwahashi, T. Komuro, S. Tanaka",
    "year": 1984,
    "venue": "1984 International Electron Devices Meeting (IEDM), pp. 464-467"
  },
  "memory-20": {
    "title": "Error Characterization, Mitigation, and Recovery in Flash-Memory-Based Solid-State Drives",
    "url": "https://arxiv.org/abs/1706.08642",
    "kind": "paper",
    "authors": "Yu Cai, Saugata Ghose, Erich F. Haratsch, Yixin Luo, Onur Mutlu",
    "year": 2017,
    "venue": "Proceedings of the IEEE 105(9):1666-1704"
  },
  "memory-21": {
    "title": "TN-29-19: NAND Flash 101: An Introduction to NAND Flash and How to Design It In to Your Next Product",
    "url": "https://user.eng.umd.edu/~blj/CS-590.26/micron-tn2919.pdf",
    "kind": "datasheet",
    "authors": "Micron Technology",
    "venue": "Micron technical note (copy hosted on UMD course page)"
  },
  "memory-22": {
    "title": "SSD Endurance and HDD Workloads (white paper)",
    "url": "https://documents.westerndigital.com/content/dam/doc-library/en_us/assets/public/western-digital/collateral/white-paper/white-paper-ssd-endurance-and-hdd-workloads.pdf",
    "kind": "datasheet",
    "authors": "Western Digital",
    "year": 2023,
    "venue": "Western Digital white paper (Jan 2023)"
  },
  "memory-24": {
    "title": "CODATA value: speed of light in vacuum",
    "url": "https://physics.nist.gov/cgi-bin/cuu/Value?c",
    "kind": "standard",
    "authors": "NIST",
    "year": 2022,
    "venue": "NIST Reference on Constants, Units, and Uncertainty (CODATA 2022)"
  },
  "memory-25": {
    "title": "1966: Semiconductor RAMs Serve High-speed Storage Needs",
    "url": "https://www.computerhistory.org/siliconengine/semiconductor-rams-serve-high-speed-storage-needs/",
    "kind": "museum",
    "authors": "Computer History Museum",
    "venue": "CHM, The Silicon Engine timeline"
  },
  "time-1": {
    "title": "Design of Ion-Implanted MOSFET's with Very Small Physical Dimensions",
    "url": "https://faculty.sist.shanghaitech.edu.cn/faculty/zhoupq/Teaching/Spr17/Dennard-jssc1974.pdf",
    "kind": "paper",
    "authors": "R. H. Dennard, F. H. Gaensslen, H.-N. Yu, V. L. Rideout, E. Bassous, A. R. LeBlanc",
    "year": 1974,
    "venue": "IEEE Journal of Solid-State Circuits, vol. SC-9, no. 5, pp. 256-268"
  },
  "time-2": {
    "title": "A 30 Year Retrospective on Dennard's MOSFET Scaling Paper",
    "url": "https://www.eng.auburn.edu/~agrawvd/COURSE/READING/LOWP/Boh07.pdf",
    "kind": "article",
    "authors": "Mark Bohr (Intel)",
    "year": 2007,
    "venue": "IEEE Solid-State Circuits Society Newsletter, vol. 12, no. 1, pp. 11-13"
  },
  "time-3": {
    "title": "A New Golden Age for Computer Architecture (Turing Lecture)",
    "url": "https://www.doc.ic.ac.uk/~wl/teachlocal/arch/papers/cacm19golden-age.pdf",
    "kind": "paper",
    "authors": "John L. Hennessy, David A. Patterson",
    "year": 2019,
    "venue": "Communications of the ACM, vol. 62, no. 2, pp. 48-60"
  },
  "time-4": {
    "title": "CIS 371 Computer Organization and Design, Unit 5: Pipelining (lecture slides)",
    "url": "https://acg.cis.upenn.edu/milom/cis371-Spring13/lectures/05_pipeline.pdf",
    "kind": "course",
    "authors": "Milo Martin (based on slides by Amir Roth and Milo Martin), University of Pennsylvania",
    "year": 2013,
    "venue": "University of Pennsylvania course notes"
  },
  "time-5": {
    "title": "Micropipelines (1988 ACM Turing Award Lecture)",
    "url": "https://www.eng.auburn.edu/~uguin/teaching/READING/E6200/Micropipeline_sutherland.pdf",
    "kind": "paper",
    "authors": "Ivan E. Sutherland",
    "year": 1989,
    "venue": "Communications of the ACM, vol. 32, no. 6, pp. 720-738"
  },
  "time-6": {
    "title": "Improvements in Ionic Relays (British Patent Specification 148,582)",
    "url": "https://www.jnorman.com/pages/books/42964/william-henry-eccles-frank-wilfred-jordan/patent-specification-148-582-improvements-in-ionic-relays",
    "kind": "patent",
    "authors": "William Henry Eccles, Frank Wilfred Jordan",
    "year": 1918,
    "venue": "British patent, filed 21 June 1918, published 1920"
  },
  "time-7": {
    "title": "7030 Engineering Console (IBM Stretch), catalog 102716145",
    "url": "https://www.computerhistory.org/collections/catalog/102716145",
    "kind": "museum",
    "authors": "Computer History Museum",
    "year": 1961,
    "venue": "Computer History Museum collection catalog"
  },
  "time-8": {
    "title": "A Study of Branch Prediction Strategies",
    "url": "https://www.cs.binghamton.edu/~ghose/CS522/papers/smith81isca.pdf",
    "kind": "paper",
    "authors": "James E. Smith",
    "year": 1981,
    "venue": "Proc. 8th Annual International Symposium on Computer Architecture (ISCA), pp. 135-148"
  },
  "time-10": {
    "title": "CMOS VLSI Design, 4th ed., Lecture 7: Power",
    "url": "https://pages.hmc.edu/harris/cmosvlsi/4e/lect/lect7.pdf",
    "kind": "course",
    "authors": "David Harris (Harvey Mudd College), companion to Weste & Harris, CMOS VLSI Design",
    "year": 2010,
    "venue": "Harvey Mudd College lecture slides for Weste & Harris, CMOS VLSI Design: A Circuits and Systems Perspective (4th ed.)"
  },
  "time-12": {
    "title": "The Free Lunch Is Over: A Fundamental Turn Toward Concurrency in Software",
    "url": "http://www.gotw.ca/publications/concurrency-ddj.htm",
    "kind": "article",
    "authors": "Herb Sutter",
    "year": 2005,
    "venue": "Dr. Dobb's Journal 30(3), March 2005"
  },
  "time-14": {
    "title": "Dark Silicon and the End of Multicore Scaling",
    "url": "https://www.cs.sfu.ca/~alaa/courses/cmpt450/fall2022/papers/esmaeilzadeh-isca-2011.pdf",
    "kind": "paper",
    "authors": "H. Esmaeilzadeh, E. Blem, R. St. Amant, K. Sankaralingam, D. Burger",
    "year": 2012,
    "venue": "IEEE Micro, vol. 32, no. 3 (Top Picks version of the ISCA 2011 paper, ACM DOI 10.1145/2000064.2000108)"
  },
  "fab-1": {
    "title": "Milestones: Czochralski Process, 1916",
    "url": "https://ethw.org/Milestones:Czochralski_Process,_1916",
    "kind": "museum",
    "authors": "IEEE / Engineering and Technology History Wiki",
    "venue": "ETHW (IEEE Milestone)"
  },
  "fab-2": {
    "title": "Silicon Wafers",
    "url": "https://www.shinetsu.co.jp/en/products/electronics-materials/silicon-wafers/",
    "kind": "datasheet",
    "authors": "Shin-Etsu Chemical Co.",
    "venue": "shinetsu.co.jp product page"
  },
  "fab-3": {
    "title": "Siltronic Fact Book 2018",
    "url": "https://www.siltronic.com/fileadmin/investorrelations/Siltronic_Fact_Book_2018.pdf",
    "kind": "datasheet",
    "authors": "Siltronic AG",
    "year": 2018,
    "venue": "Siltronic investor relations"
  },
  "fab-4": {
    "title": "Why Do Silicon Wafers Have Flats Cut Out of the Wafer Edge?",
    "url": "https://www.universitywafer.com/silicon-wafer-flats.html",
    "kind": "article",
    "authors": "UniversityWafer Inc.",
    "venue": "universitywafer.com (wafer vendor)"
  },
  "fab-6": {
    "title": "1955: Photolithography Techniques Are Used to Make Silicon Devices",
    "url": "https://www.computerhistory.org/siliconengine/photolithography-techniques-are-used-to-make-silicon-devices/",
    "kind": "museum",
    "authors": "Computer History Museum",
    "venue": "The Silicon Engine timeline"
  },
  "fab-7": {
    "title": "1959: Practical Monolithic Integrated Circuit Concept Patented / Invention of the Planar Manufacturing Process",
    "url": "https://www.computerhistory.org/siliconengine/invention-of-the-planar-manufacturing-process/",
    "kind": "museum",
    "authors": "Computer History Museum",
    "venue": "The Silicon Engine timeline"
  },
  "fab-8": {
    "title": "Lithography principles",
    "url": "https://www.asml.com/en/technology/lithography-principles",
    "kind": "datasheet",
    "authors": "ASML",
    "venue": "asml.com"
  },
  "fab-10": {
    "title": "The Rayleigh criterion",
    "url": "https://www.asml.com/en/technology/lithography-principles/rayleigh-criterion",
    "kind": "datasheet",
    "authors": "ASML",
    "venue": "asml.com"
  },
  "fab-11": {
    "title": "Light & lasers",
    "url": "https://www.asml.com/en/technology/lithography-principles/light-and-lasers",
    "kind": "datasheet",
    "authors": "ASML",
    "venue": "asml.com"
  },
  "fab-12": {
    "title": "EUV lithography systems",
    "url": "https://www.asml.com/en/products/euv-lithography-systems",
    "kind": "datasheet",
    "authors": "ASML",
    "venue": "asml.com"
  },
  "fab-13": {
    "title": "TWINSCAN NXT:2100i",
    "url": "https://www.asml.com/en/products/duv-lithography-systems/twinscan-nxt2100i",
    "kind": "datasheet",
    "authors": "ASML",
    "venue": "asml.com product page"
  },
  "fab-14": {
    "title": "Burn Jeng Lin",
    "url": "https://ethw.org/Burn_Jeng_Lin",
    "kind": "museum",
    "authors": "Engineering and Technology History Wiki",
    "venue": "ETHW biography"
  },
  "fab-15": {
    "title": "TSMC's N7+ Technology is First EUV Process Delivering Customer Products to Market in High Volume",
    "url": "https://pr.tsmc.com/english/news/2010",
    "kind": "article",
    "authors": "TSMC",
    "year": 2019,
    "venue": "TSMC press release, 7 Oct 2019"
  },
  "fab-16": {
    "title": "A 90 nm logic technology featuring 50 nm strained silicon channel transistors, 7 layers of Cu interconnects, low k ILD, and 1 um2 SRAM cell",
    "url": "https://ewh.ieee.org/r5/denver/sscs/References/2002_12_Thompson.pdf",
    "kind": "paper",
    "authors": "S. Thompson et al. (Intel)",
    "year": 2002,
    "venue": "IEDM 2002 Digest, pp. 61-64"
  },
  "fab-17": {
    "title": "Intel 4 Process Drops Cobalt Interconnect, Goes with Tried and Tested Copper with Cobalt Liner/Cap",
    "url": "https://www.semiconductor-digest.com/intel-4-process-drops-cobalt-interconnect-goes-with-tried-and-tested-copper-with-cobalt-liner-cap/",
    "kind": "article",
    "authors": "Semiconductor Digest",
    "year": 2022,
    "venue": "Semiconductor Digest"
  },
  "fab-18": {
    "title": "Battling Fab Cycle Times",
    "url": "https://semiengineering.com/battling-fab-cycle-times/",
    "kind": "article",
    "authors": "Mark LaPedus",
    "year": 2017,
    "venue": "Semiconductor Engineering, 16 Feb 2017"
  },
  "fab-19": {
    "title": "When does it make sense to move from a monolithic ASIC to a chiplet-based design?",
    "url": "https://www.imec-int.com/en/articles/when-does-it-make-sense-move-monolithic-asic-chiplet-based-design",
    "kind": "article",
    "authors": "imec",
    "year": 2026,
    "venue": "imec article, 23 June 2026"
  },
  "fab-20": {
    "title": "Variation-aware speed binning of multi-core processors",
    "url": "https://experts.umn.edu/en/publications/variation-aware-speed-binning-of-multi-core-processors/",
    "kind": "paper",
    "authors": "J. Sartori, A. Pant, R. Kumar, P. Gupta",
    "year": 2010,
    "venue": "ISQED 2010"
  },
  "fab-21": {
    "title": "AMD Phenom X3 8750 2.4 GHz Triple-Core Processor Review",
    "url": "https://pcper.com/2008/04/amd-phenom-x3-8750-2-4-ghz-triple-core-processor-review/",
    "kind": "article",
    "authors": "PC Perspective",
    "year": 2008,
    "venue": "PC Perspective, April 2008"
  },
  "fab-22": {
    "title": "A Better Way to Measure Progress in Semiconductors",
    "url": "https://spectrum.ieee.org/a-better-way-to-measure-progress-in-semiconductors",
    "kind": "article",
    "authors": "Samuel K. Moore",
    "year": 2020,
    "venue": "IEEE Spectrum, 21 July 2020"
  },
  "fab-23": {
    "title": "International Roadmap for Devices and Systems 2022: More Moore",
    "url": "https://irds.ieee.org/images/files/pdf/2022/2022IRDS_MM.pdf",
    "kind": "standard",
    "authors": "IEEE IRDS",
    "year": 2022,
    "venue": "IRDS"
  },
  "fab-25": {
    "title": "The prehistory of EUV",
    "url": "https://bits-chips.com/article/the-prehistory-of-euv/",
    "kind": "article",
    "authors": "Bits&Chips",
    "venue": "Bits&Chips"
  },
  "board-1": {
    "title": "Radio set containing original printed circuit boards",
    "url": "https://collection.sciencemuseumgroup.org.uk/objects/co521118/radio-set-containing-original-printed-circuit-boards",
    "kind": "museum",
    "authors": "Science Museum Group",
    "year": 1942,
    "venue": "Science Museum Group Collection (object co521118)"
  },
  "board-2": {
    "title": "Manufacture of electric circuits and circuit components (GB639178A)",
    "url": "https://patents.google.com/patent/GB639178A/en",
    "kind": "patent",
    "authors": "Paul Eisler; Harold Vezey Strong",
    "year": 1950,
    "venue": "UK patent, priority 2 Feb 1943, published 21 Jun 1950"
  },
  "board-3": {
    "title": "Why Are Circuit Boards Green? Unraveling the Mystery Behind the Iconic Color",
    "url": "https://www.wevolver.com/article/why-are-circuit-boards-green",
    "kind": "article",
    "authors": "Umar Waseem",
    "year": 2024,
    "venue": "Wevolver"
  },
  "board-4": {
    "title": "HDI Laptop Motherboard PCB Design & Fabrication",
    "url": "https://aptpcb.com/en/blog/laptop-pcb",
    "kind": "article",
    "authors": "APTPCB",
    "venue": "APTPCB (PCB fabricator) blog"
  },
  "board-5": {
    "title": "High-Speed Layout Guidelines (SCAA082A)",
    "url": "https://www.ti.com/lit/an/scaa082a/scaa082a.pdf",
    "kind": "datasheet",
    "authors": "Alexander Weiler, Alexander Pakosta, Ankur Verma (Texas Instruments)",
    "year": 2017,
    "venue": "TI Application Report, Nov 2006, rev. Aug 2017"
  },
  "board-6": {
    "title": "AM62x, AM62Lx DDR Board Design and Layout Guidelines (SPRAD06C)",
    "url": "https://www.ti.com/lit/pdf/sprad06",
    "kind": "datasheet",
    "authors": "Texas Instruments",
    "year": 2025,
    "venue": "TI Application Note, Mar 2022, rev. Mar 2025"
  },
  "board-7": {
    "title": "The Virtual Write Queue: Coordinating DRAM and Last-Level Cache Policies",
    "url": "https://lca.ece.utexas.edu/pubs/ISCA_2010.pdf",
    "kind": "paper",
    "authors": "Jeffrey Stuecheli, Dimitris Kaseridis, David Daly, Hillery C. Hunter, Lizy K. John",
    "year": 2010,
    "venue": "ISCA 2010 (37th Int. Symp. on Computer Architecture), pp. 72-82"
  },
  "board-8": {
    "title": "Introduction to PCI Express (TIPS0456)",
    "url": "https://lenovopress.lenovo.com/tips0456",
    "kind": "article",
    "authors": "David Watts",
    "year": 2005,
    "venue": "Lenovo Press (formerly IBM Redbooks tip)"
  },
  "board-9": {
    "title": "12th Generation Intel Core Processors Datasheet, Volume 1 of 2 (Doc. 655258, Rev. 011)",
    "url": "https://cdrdv2-public.intel.com/655258/655258-011.pdf",
    "kind": "datasheet",
    "authors": "Intel Corporation",
    "year": 2025,
    "venue": "Intel datasheet, May 2025"
  },
  "board-10": {
    "title": "BU-302: Series and Parallel Battery Configurations",
    "url": "https://www.batteryuniversity.com/article/bu-302-series-and-parallel-battery-configurations/",
    "kind": "article",
    "authors": "Battery University (Cadex Electronics)",
    "venue": "Battery University"
  },
  "board-11": {
    "title": "Filter Inductor and Flyback Transformer Design for Switching Power Supplies (SLUP076)",
    "url": "https://www.ti.com/lit/pdf/slup076",
    "kind": "datasheet",
    "authors": "Lloyd H. Dixon Jr. (Unitrode / Texas Instruments)",
    "venue": "Unitrode Magnetics Design Handbook, TI literature SLUP076"
  },
  "board-14": {
    "title": "Heat Pipes 101",
    "url": "https://www.1-act.com/thermal-solutions/passive/heat-pipes/heat-pipes-101/",
    "kind": "article",
    "authors": "Advanced Cooling Technologies, Inc.",
    "venue": "ACT (heat pipe manufacturer) technical page"
  },
  "board-15": {
    "title": "Structures of Very High Thermal Conductance",
    "url": "https://www.osti.gov/biblio/4067392",
    "kind": "paper",
    "authors": "G. M. Grover, T. P. Cotter, G. F. Erickson",
    "year": 1964,
    "venue": "Journal of Applied Physics 35(6), 1990"
  },
  "board-16": {
    "title": "Heat transfer device (US 2,350,348)",
    "url": "https://patents.google.com/patent/US2350348A/en",
    "kind": "patent",
    "authors": "Richard S. Gaugler (General Motors)",
    "year": 1944,
    "venue": "US patent, filed 21 Dec 1942, published 6 Jun 1944"
  },
  "board-17": {
    "title": "Father of the heat pipe passes away",
    "url": "https://www.lanl.gov/media/publications/national-security-science/0719-father-of-the-heat-pipe-passes-away",
    "kind": "article",
    "authors": "Los Alamos National Laboratory, National Security Science",
    "year": 2019,
    "venue": "LANL National Security Science magazine"
  },
  "board-18": {
    "title": "USB inventor Ajay V. Bhatt wins 2013 European Inventor Award",
    "url": "https://www.prnewswire.com/news-releases/usb-inventor-ajay-v-bhatt-wins-2013-european-inventor-award-209148681.html",
    "kind": "article",
    "authors": "European Patent Office (via PR Newswire)",
    "year": 2013,
    "venue": "PR Newswire, 28 May 2013"
  },
  "io-1": {
    "title": "I/O Devices (Chapter 36)",
    "url": "https://pages.cs.wisc.edu/~remzi/OSTEP/file-devices.pdf",
    "kind": "book",
    "authors": "Remzi H. Arpaci-Dusseau, Andrea C. Arpaci-Dusseau",
    "year": 2025,
    "venue": "Operating Systems: Three Easy Pieces (chapter PDF, © 2008–25), Arpaci-Dusseau Books"
  },
  "io-2": {
    "title": "Eliminating receive livelock in an interrupt-driven kernel",
    "url": "https://dl.acm.org/doi/10.1145/263326.263335",
    "kind": "paper",
    "authors": "Jeffrey C. Mogul, K. K. Ramakrishnan",
    "year": 1997,
    "venue": "ACM Transactions on Computer Systems"
  },
  "io-3": {
    "title": "NAPI (Linux networking documentation)",
    "url": "https://docs.kernel.org/networking/napi.html",
    "kind": "docs",
    "authors": "The Linux kernel developers",
    "year": 2025,
    "venue": "docs.kernel.org"
  },
  "io-4": {
    "title": "Intel 64 and IA-32 Architectures Software Developer's Manual, Vol. 3 (3A–3D): System Programming Guide, Order No. 325384-092US, June 2026",
    "url": "https://cdrdv2.intel.com/v1/dl/getContent/671447",
    "kind": "standard",
    "authors": "Intel Corporation",
    "year": 2026,
    "venue": "Intel"
  },
  "io-5": {
    "title": "History and Overview of Interrupts and Interrupt Systems",
    "url": "https://mark.people.clemson.edu/interrupts.html",
    "kind": "article",
    "authors": "Mark Smotherman",
    "year": 2017,
    "venue": "Clemson University (web)"
  },
  "io-6": {
    "title": "Communication in the Presence of Noise",
    "url": "https://doi.org/10.1109/JRPROC.1949.232969",
    "kind": "paper",
    "authors": "C. E. Shannon",
    "year": 1949,
    "venue": "Proceedings of the IRE 37(1):10–21"
  },
  "io-7": {
    "title": "Spectra of Quantized Signals",
    "url": "https://doi.org/10.1002/j.1538-7305.1948.tb01340.x",
    "kind": "paper",
    "authors": "W. R. Bennett",
    "year": 1948,
    "venue": "Bell System Technical Journal 27(3):446–472"
  },
  "io-8": {
    "title": "drivers/gpu/drm/i915/display/intel_psr.c — 'DOC: Panel Self Refresh (PSR/SRD)'",
    "url": "https://github.com/torvalds/linux/blob/master/drivers/gpu/drm/i915/display/intel_psr.c",
    "kind": "docs",
    "authors": "Intel / Linux kernel developers",
    "year": 2026,
    "venue": "Linux kernel source (torvalds/linux)"
  },
  "io-9": {
    "title": "VESA Publishes Embedded DisplayPort Standard Version 1.5",
    "url": "https://vesa.org/featured-articles/vesa-publishes-embedded-displayport-standard-version-1-5/",
    "kind": "standard",
    "authors": "VESA",
    "year": 2021,
    "venue": "vesa.org"
  },
  "io-10": {
    "title": "RFC 791: Internet Protocol",
    "url": "https://www.rfc-editor.org/rfc/rfc791.html",
    "kind": "standard",
    "authors": "J. Postel (ed.)",
    "year": 1981,
    "venue": "IETF RFC 791"
  },
  "io-11": {
    "title": "End-to-end arguments in system design",
    "url": "https://doi.org/10.1145/357401.357402",
    "kind": "paper",
    "authors": "J. H. Saltzer, D. P. Reed, D. D. Clark",
    "year": 1984,
    "venue": "ACM Transactions on Computer Systems 2(4):277–288"
  },
  "boot-1": {
    "title": "Voltage Supervisors (Reset ICs): Frequently Asked Questions (SLVAE47A)",
    "url": "https://www.ti.com/lit/SLVAE47",
    "kind": "datasheet",
    "authors": "Michael DeSando, Texas Instruments",
    "year": 2020,
    "venue": "TI Application Report"
  },
  "boot-2": {
    "title": "Voltage Supervisors (Reset ICs) Quick Reference Guide (SLYT361)",
    "url": "https://www.ti.com/lit/slyt361",
    "kind": "datasheet",
    "authors": "Texas Instruments",
    "year": 2019,
    "venue": "TI"
  },
  "boot-3": {
    "title": "Power-Up SRAM State as an Identifying Fingerprint and Source of True Random Numbers",
    "url": "https://doi.org/10.1109/TC.2008.212",
    "kind": "paper",
    "authors": "Daniel E. Holcomb, Wayne P. Burleson, Kevin Fu",
    "year": 2009,
    "venue": "IEEE Transactions on Computers 58(9):1198–1210"
  },
  "boot-4": {
    "title": "coreboot architecture (Getting started)",
    "url": "https://doc.coreboot.org/getting_started/architecture.html",
    "kind": "docs",
    "authors": "coreboot project",
    "year": 2026,
    "venue": "doc.coreboot.org"
  },
  "boot-5": {
    "title": "AMD Family 17h in coreboot",
    "url": "https://doc.coreboot.org/soc/amd/family17h.html",
    "kind": "docs",
    "authors": "coreboot project",
    "year": 2026,
    "venue": "doc.coreboot.org"
  },
  "boot-6": {
    "title": "Boot process for iPhone and iPad devices (Apple Platform Security)",
    "url": "https://support.apple.com/guide/security/boot-process-for-iphone-and-ipad-devices-secb3000f149/web",
    "kind": "docs",
    "authors": "Apple Inc.",
    "year": 2024,
    "venue": "Apple Platform Security Guide"
  },
  "boot-7": {
    "title": "The Linux/x86 Boot Protocol",
    "url": "https://www.kernel.org/doc/html/latest/arch/x86/boot.html",
    "kind": "docs",
    "authors": "The Linux kernel developers",
    "year": 2026,
    "venue": "docs.kernel.org"
  },
  "boot-8": {
    "title": "Mechanism: Limited Direct Execution (Chapter 6)",
    "url": "https://pages.cs.wisc.edu/~remzi/OSTEP/cpu-mechanisms.pdf",
    "kind": "book",
    "authors": "Remzi H. Arpaci-Dusseau, Andrea C. Arpaci-Dusseau",
    "year": 2025,
    "venue": "Operating Systems: Three Easy Pieces (chapter PDF, © 2008–25), Arpaci-Dusseau Books"
  },
  "kernel-1": {
    "title": "The protection of information in computer systems",
    "url": "https://doi.org/10.1109/PROC.1975.9939",
    "kind": "paper",
    "authors": "Jerome H. Saltzer, Michael D. Schroeder",
    "year": 1975,
    "venue": "Proceedings of the IEEE 63(9):1278–1308"
  },
  "kernel-2": {
    "title": "A hardware architecture for implementing protection rings",
    "url": "https://doi.org/10.1145/361268.361275",
    "kind": "paper",
    "authors": "Michael D. Schroeder, Jerome H. Saltzer",
    "year": 1972,
    "venue": "Communications of the ACM 15(3):157–170"
  },
  "kernel-3": {
    "title": "Efficient software-based fault isolation",
    "url": "https://doi.org/10.1145/168619.168635",
    "kind": "paper",
    "authors": "Robert Wahbe, Steven Lucco, Thomas E. Anderson, Susan L. Graham",
    "year": 1993,
    "venue": "SOSP '93, pp. 203–216"
  },
  "kernel-4": {
    "title": "FlexSC: Flexible System Call Scheduling with Exception-Less System Calls",
    "url": "https://www.usenix.org/legacy/event/osdi10/tech/full_papers/Soares.pdf",
    "kind": "paper",
    "authors": "Livio Soares, Michael Stumm",
    "year": 2010,
    "venue": "OSDI '10, pp. 33–46"
  },
  "kernel-5": {
    "title": "An experimental time-sharing system",
    "url": "https://doi.org/10.1145/1460833.1460871",
    "kind": "paper",
    "authors": "Fernando J. Corbató, Marjorie Merwin-Daggett, Robert C. Daley",
    "year": 1962,
    "venue": "AIEE-IRE '62 Spring Joint Computer Conference, p. 335ff"
  },
  "kernel-6": {
    "title": "Scheduling: Introduction (Chapter 7)",
    "url": "https://pages.cs.wisc.edu/~remzi/OSTEP/cpu-sched.pdf",
    "kind": "book",
    "authors": "Remzi H. Arpaci-Dusseau, Andrea C. Arpaci-Dusseau",
    "year": 2025,
    "venue": "Operating Systems: Three Easy Pieces (chapter PDF, © 2008–25), Arpaci-Dusseau Books"
  },
  "kernel-7": {
    "title": "EEVDF Scheduler (Linux kernel documentation)",
    "url": "https://docs.kernel.org/scheduler/sched-eevdf.html",
    "kind": "docs",
    "authors": "The Linux kernel developers",
    "year": 2025,
    "venue": "docs.kernel.org"
  },
  "kernel-8": {
    "title": "Energy Aware Scheduling (Linux kernel documentation)",
    "url": "https://docs.kernel.org/scheduler/sched-energy.html",
    "kind": "docs",
    "authors": "The Linux kernel developers",
    "year": 2025,
    "venue": "docs.kernel.org"
  },
  "kernel-9": {
    "title": "Mechanism: Address Translation (Chapter 15)",
    "url": "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-mechanism.pdf",
    "kind": "book",
    "authors": "Remzi H. Arpaci-Dusseau, Andrea C. Arpaci-Dusseau",
    "year": 2025,
    "venue": "Operating Systems: Three Easy Pieces (chapter PDF, © 2008–25), Arpaci-Dusseau Books"
  },
  "kernel-10": {
    "title": "The Abstraction: Address Spaces (Chapter 13)",
    "url": "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-intro.pdf",
    "kind": "book",
    "authors": "Remzi H. Arpaci-Dusseau, Andrea C. Arpaci-Dusseau",
    "year": 2025,
    "venue": "Operating Systems: Three Easy Pieces (chapter PDF, © 2008–25), Arpaci-Dusseau Books"
  },
  "kernel-11": {
    "title": "One-Level Storage System",
    "url": "https://doi.org/10.1109/TEC.1962.5219356",
    "kind": "paper",
    "authors": "T. Kilburn, D. B. G. Edwards, M. J. Lanigan, F. H. Sumner",
    "year": 1962,
    "venue": "IRE/IEEE Transactions on Electronic Computers EC-11(2):223–235"
  },
  "kernel-12": {
    "title": "Virtual Memory",
    "url": "https://doi.org/10.1145/356571.356573",
    "kind": "paper",
    "authors": "Peter J. Denning",
    "year": 1970,
    "venue": "ACM Computing Surveys 2(3):153–189"
  },
  "kernel-13": {
    "title": "User Mode and Kernel Mode (Windows drivers)",
    "url": "https://learn.microsoft.com/en-us/windows-hardware/drivers/gettingstarted/user-mode-and-kernel-mode",
    "kind": "docs",
    "authors": "Microsoft",
    "year": 2025,
    "venue": "Microsoft Learn"
  },
  "os-1": {
    "title": "Appendix A: The Tanenbaum–Torvalds Debate",
    "url": "https://www.oreilly.com/openbook/opensources/book/appa.html",
    "kind": "book",
    "authors": "Andrew S. Tanenbaum, Linus Torvalds et al. (comp.os.minix, 1992); in C. DiBona, S. Ockman, M. Stone (eds.)",
    "year": 1999,
    "venue": "Open Sources: Voices from the Open Source Revolution, O'Reilly (ISBN 1-56592-582-3)"
  },
  "os-2": {
    "title": "On micro-kernel construction",
    "url": "https://doi.org/10.1145/224056.224075",
    "kind": "paper",
    "authors": "Jochen Liedtke",
    "year": 1995,
    "venue": "SOSP '95, pp. 237–250"
  },
  "os-4": {
    "title": "MINIX 3: a highly reliable, self-repairing operating system",
    "url": "https://doi.org/10.1145/1151374.1151391",
    "kind": "paper",
    "authors": "Jorrit N. Herder, Herbert Bos, Ben Gras, Philip Homburg, Andrew S. Tanenbaum",
    "year": 2006,
    "venue": "ACM SIGOPS Operating Systems Review 40(3):80–89"
  },
  "os-5": {
    "title": "The nucleus of a multiprogramming system",
    "url": "https://doi.org/10.1145/362258.362278",
    "kind": "paper",
    "authors": "Per Brinch Hansen",
    "year": 1970,
    "venue": "Communications of the ACM 13(4):238–241"
  },
  "os-6": {
    "title": "Mach: A New Kernel Foundation for UNIX Development",
    "url": "https://cseweb.ucsd.edu/classes/wi11/cse221/papers/accetta86.pdf",
    "kind": "paper",
    "authors": "Mike Accetta, Robert Baron, William Bolosky, David Golub, Richard Rashid, Avadis Tevanian, Michael Young",
    "year": 1986,
    "venue": "USENIX Summer Conference 1986, pp. 93–113"
  },
  "os-7": {
    "title": "MS Windows NT Kernel-mode User and GDI White Paper",
    "url": "https://learn.microsoft.com/en-us/previous-versions/cc750820(v=technet.10)",
    "kind": "docs",
    "authors": "Microsoft Corporation",
    "year": 1996,
    "venue": "Microsoft TechNet (archived on Microsoft Learn)"
  },
  "os-8": {
    "title": "Kernel Programming Guide: Kernel Architecture Overview",
    "url": "https://developer.apple.com/library/archive/documentation/Darwin/Conceptual/KernelProgramming/Architecture/Architecture.html",
    "kind": "docs",
    "authors": "Apple Inc.",
    "year": 2013,
    "venue": "Apple Developer Documentation Archive"
  },
  "os-9": {
    "title": "The Userspace I/O HOWTO",
    "url": "https://docs.kernel.org/driver-api/uio-howto.html",
    "kind": "docs",
    "authors": "The Linux kernel developers",
    "year": 2025,
    "venue": "docs.kernel.org"
  },
  "os-10": {
    "title": "The UNIX time-sharing system",
    "url": "https://doi.org/10.1145/361011.361061",
    "kind": "paper",
    "authors": "Dennis M. Ritchie, Ken Thompson",
    "year": 1974,
    "venue": "Communications of the ACM 17(7):365–375"
  },
  "os-11": {
    "title": "The Open Group Base Specifications Issue 8 (IEEE Std 1003.1-2024, POSIX.1)",
    "url": "https://pubs.opengroup.org/onlinepubs/9799919799/",
    "kind": "standard",
    "authors": "IEEE / The Open Group",
    "year": 2024,
    "venue": "The Open Group"
  },
  "os-12": {
    "title": "arch/x86/entry/syscalls/syscall_64.tbl",
    "url": "https://github.com/torvalds/linux/blob/master/arch/x86/entry/syscalls/syscall_64.tbl",
    "kind": "docs",
    "authors": "Linux kernel developers",
    "year": 2026,
    "venue": "Linux kernel source"
  },
  "os-13": {
    "title": "Scheduling Algorithms for Multiprogramming in a Hard-Real-Time Environment",
    "url": "https://doi.org/10.1145/321738.321743",
    "kind": "paper",
    "authors": "C. L. Liu, James W. Layland",
    "year": 1973,
    "venue": "Journal of the ACM 20(1):46–61"
  },
  "os-14": {
    "title": "The worst-case execution-time problem—overview of methods and survey of tools",
    "url": "https://doi.org/10.1145/1347375.1347389",
    "kind": "paper",
    "authors": "Reinhard Wilhelm, Jakob Engblom, Andreas Ermedahl, Niklas Holsti, Stephan Thesing, David Whalley, et al.",
    "year": 2008,
    "venue": "ACM Transactions on Embedded Computing Systems 7(3)"
  },
  "os-15": {
    "title": "This Car Runs on Code",
    "url": "https://spectrum.ieee.org/this-car-runs-on-code",
    "kind": "article",
    "authors": "Robert N. Charette",
    "year": 2009,
    "venue": "IEEE Spectrum (1 Feb 2009)"
  },
  "compile-1": {
    "title": "Compilers: Principles, Techniques, and Tools (2nd ed.)",
    "url": "http://infolab.stanford.edu/~ullman/dragon.html",
    "kind": "book",
    "authors": "Alfred V. Aho, Monica S. Lam, Ravi Sethi, Jeffrey D. Ullman",
    "year": 2006,
    "venue": "Pearson / Addison-Wesley"
  },
  "compile-2": {
    "title": "The education of a computer",
    "url": "https://www.computerhistory.org/timeline/1952/",
    "kind": "paper",
    "authors": "Grace M. Hopper",
    "year": 1952,
    "venue": "Proceedings of the 1952 ACM National Meeting (Pittsburgh), pp. 243-249"
  },
  "compile-3": {
    "title": "The FORTRAN automatic coding system",
    "url": "https://doi.org/10.1145/1455567.1455599",
    "kind": "paper",
    "authors": "J. W. Backus, R. J. Beeber, S. Best, R. Goldberg, L. M. Haibt, H. L. Herrick, R. A. Nelson, D. Sayre, P. B. Sheridan, H. Stern, I. Ziller, R. A. Hughes, R. Nutt",
    "year": 1957,
    "venue": "Western Joint Computer Conference (IRE-AIEE-ACM '57 Western), pp. 188-198"
  },
  "compile-4": {
    "title": "Superoptimizer: a look at the smallest program",
    "url": "https://doi.org/10.1145/36206.36194",
    "kind": "paper",
    "authors": "Henry Massalin",
    "year": 1987,
    "venue": "ASPLOS II, pp. 122-126"
  },
  "compile-5": {
    "title": "Code Generation for a One-Register Machine",
    "url": "https://doi.org/10.1145/321958.321971",
    "kind": "paper",
    "authors": "J. Bruno, R. Sethi",
    "year": 1976,
    "venue": "Journal of the ACM 23(3)"
  },
  "compile-6": {
    "title": "Code Generation for Expressions with Common Subexpressions",
    "url": "https://doi.org/10.1145/321992.322001",
    "kind": "paper",
    "authors": "A. V. Aho, S. C. Johnson, J. D. Ullman",
    "year": 1977,
    "venue": "Journal of the ACM 24(1)"
  },
  "compile-7": {
    "title": "Control flow analysis",
    "url": "https://doi.org/10.1145/390013.808479",
    "kind": "paper",
    "authors": "Frances E. Allen",
    "year": 1970,
    "venue": "ACM SIGPLAN Notices 5(7), pp. 1-19 (Symposium on Compiler Optimization)"
  },
  "compile-8": {
    "title": "The RISC-V Instruction Set Manual, Volume I: Unprivileged ISA (RV32I Base Integer Instruction Set)",
    "url": "https://docs.riscv.org/reference/isa/v20260120/unpriv/rv32.html",
    "kind": "standard",
    "authors": "RISC-V International (eds. A. Waterman, K. Asanovic et al.)",
    "year": 2026,
    "venue": "RISC-V International, version 20260120"
  },
  "compile-9": {
    "title": "Intel 64 and IA-32 Architectures Software Developer's Manual, Volume 2A: Instruction Set Reference A-L",
    "url": "https://cdrdv2-public.intel.com/819712/253666-sdm-vol-2a.pdf",
    "kind": "datasheet",
    "authors": "Intel Corporation",
    "year": 2024,
    "venue": "Intel, order no. 253666"
  },
  "compile-10": {
    "title": "First Draft of a Report on the EDVAC",
    "url": "https://archive.org/details/vnedvac",
    "kind": "article",
    "authors": "John von Neumann",
    "year": 1945,
    "venue": "Moore School of Electrical Engineering, University of Pennsylvania (30 June 1945)"
  },
  "compile-11": {
    "title": "Architecture of the IBM System/360",
    "url": "https://www.ece.ucdavis.edu/~vojin/CLASSES/EEC272/S2005/Papers/IBM360-Amdahl_april64.pdf",
    "kind": "paper",
    "authors": "G. M. Amdahl, G. A. Blaauw, F. P. Brooks Jr.",
    "year": 1964,
    "venue": "IBM Journal of Research and Development 8(2), pp. 87-101"
  },
  "compile-12": {
    "title": "Computer Architecture: A Quantitative Approach (7th ed.)",
    "url": "https://shop.elsevier.com/books/computer-architecture/hennessy/978-0-443-15406-5",
    "kind": "book",
    "authors": "John L. Hennessy, David A. Patterson, Christos Kozyrakis",
    "year": 2025,
    "venue": "Morgan Kaufmann / Elsevier"
  },
  "compile-13": {
    "title": "Implementing precise interrupts in pipelined processors",
    "url": "https://doi.org/10.1109/12.4607",
    "kind": "paper",
    "authors": "J. E. Smith, A. R. Pleszkun",
    "year": 1988,
    "venue": "IEEE Transactions on Computers 37(5), pp. 562-573 (conference version ISCA 1985)"
  },
  "compile-14": {
    "title": "An Efficient Algorithm for Exploiting Multiple Arithmetic Units",
    "url": "https://doi.org/10.1147/rd.111.0025",
    "kind": "paper",
    "authors": "R. M. Tomasulo",
    "year": 1967,
    "venue": "IBM Journal of Research and Development 11(1), pp. 25-33"
  },
  "compile-18": {
    "title": "A study of branch prediction strategies",
    "url": "https://doi.org/10.1145/285930.285980",
    "kind": "paper",
    "authors": "James E. Smith",
    "year": 1981,
    "venue": "ISCA 1981; reprinted in 25 Years of ISCA (Selected Papers), 1998, pp. 202-215"
  },
  "compile-19": {
    "title": "Spectre Attacks: Exploiting Speculative Execution",
    "url": "https://spectreattack.com/spectre.pdf",
    "kind": "paper",
    "authors": "P. Kocher, J. Horn, A. Fogh, D. Genkin, D. Gruss, W. Haas, M. Hamburg, M. Lipp, S. Mangard, T. Prescher, M. Schwarz, Y. Yarom",
    "year": 2019,
    "venue": "IEEE Symposium on Security and Privacy 2019, pp. 1-19"
  },
  "compile-21": {
    "title": "A Parallel Algorithm for the Efficient Solution of a General Class of Recurrence Equations",
    "url": "https://doi.org/10.1109/TC.1973.5009159",
    "kind": "paper",
    "authors": "P. M. Kogge, H. S. Stone",
    "year": 1973,
    "venue": "IEEE Transactions on Computers C-22(8), pp. 786-793"
  },
  "compile-22": {
    "title": "A symbolic analysis of relay and switching circuits",
    "url": "https://doi.org/10.1109/T-AIEE.1938.5057767",
    "kind": "paper",
    "authors": "Claude E. Shannon",
    "year": 1938,
    "venue": "Transactions of the AIEE 57(12), pp. 713-723"
  },
  "compile-23": {
    "title": "Intel, IBM Dueling 14nm FinFETs",
    "url": "https://www.eetimes.com/intel-ibm-dueling-14nm-finfets/",
    "kind": "article",
    "authors": "EE Times",
    "year": 2014,
    "venue": "EE Times"
  },
  "compile-24": {
    "title": "CODATA 2018 X-ray and related values (lattice parameter of Si)",
    "url": "https://pml.nist.gov/cuu/pdf/xray_2018.pdf",
    "kind": "standard",
    "authors": "NIST Physical Measurement Laboratory",
    "year": 2019,
    "venue": "NIST, physics.nist.gov/constants"
  },
  "phone-1": {
    "title": "1.1 Computing's energy problem (and what we can do about it)",
    "url": "https://doi.org/10.1109/ISSCC.2014.6757323",
    "kind": "paper",
    "authors": "Mark Horowitz",
    "year": 2014,
    "venue": "IEEE ISSCC 2014 Digest of Technical Papers, pp. 10–14"
  },
  "phone-5": {
    "title": "Dark silicon and the end of multicore scaling",
    "url": "https://research.cs.wisc.edu/vertical/papers/2011/isca11-darksilicon.pdf",
    "kind": "paper",
    "authors": "Hadi Esmaeilzadeh, Emily Blem, Renée St. Amant, Karthikeyan Sankaralingam, Doug Burger",
    "year": 2011,
    "venue": "ISCA '11, pp. 365–376"
  },
  "phone-6": {
    "title": "Is dark silicon useful? Harnessing the four horsemen of the coming dark silicon apocalypse",
    "url": "https://doi.org/10.1145/2228360.2228567",
    "kind": "paper",
    "authors": "Michael B. Taylor",
    "year": 2012,
    "venue": "DAC '12, pp. 1131–1136"
  },
  "phone-7": {
    "title": "Design of ion-implanted MOSFET's with very small physical dimensions",
    "url": "https://doi.org/10.1109/JSSC.1974.1050511",
    "kind": "paper",
    "authors": "R. H. Dennard, F. H. Gaensslen, H.-N. Yu, V. L. Rideout, E. Bassous, A. R. LeBlanc",
    "year": 1974,
    "venue": "IEEE Journal of Solid-State Circuits 9(5):256–268"
  },
  "phone-8": {
    "title": "Power and Thermal Analysis of Commercial Mobile Platforms: Experiments and Case Studies",
    "url": "https://arxiv.org/abs/1904.09814",
    "kind": "paper",
    "authors": "Ganapati Bhat, Suat Gumussoy, Umit Y. Ogras",
    "year": 2019,
    "venue": "arXiv:1904.09814 (DATE 2019)"
  },
  "edge-1": {
    "title": "ESP32 Series Datasheet (v5.3)",
    "url": "https://documentation.espressif.com/esp32_datasheet_en.pdf",
    "kind": "datasheet",
    "authors": "Espressif Systems",
    "year": 2025,
    "venue": "Espressif"
  },
  "edge-2": {
    "title": "Wireless integrated network sensors",
    "url": "https://doi.org/10.1145/332833.332838",
    "kind": "paper",
    "authors": "G. J. Pottie, W. J. Kaiser",
    "year": 2000,
    "venue": "Communications of the ACM 43(5):51–58"
  },
  "edge-3": {
    "title": "Great Watchdog Timers For Embedded Systems",
    "url": "https://www.ganssle.com/watchdogs.htm",
    "kind": "article",
    "authors": "Jack Ganssle",
    "year": 2016,
    "venue": "ganssle.com"
  },
  "car-1": {
    "title": "Controller Area Network (CAN) schedulability analysis: Refuted, revisited and revised",
    "url": "https://link.springer.com/article/10.1007/s11241-007-9012-7",
    "kind": "paper",
    "authors": "Robert I. Davis, Alan Burns, Reinder J. Bril, Johan J. Lukkien",
    "year": 2007,
    "venue": "Real-Time Systems 35(3):239-272"
  },
  "car-2": {
    "title": "CAN Specification Version 2.0 (Part A and Part B)",
    "url": "https://www.nxp.com/docs/en/reference-manual/BCANPSV2.pdf",
    "kind": "standard",
    "authors": "Robert Bosch GmbH",
    "year": 1991,
    "venue": "Robert Bosch GmbH, Stuttgart (reprinted by Motorola/Freescale as BCANPSV2)"
  },
  "car-3": {
    "title": "History of CAN technology",
    "url": "https://www.can-cia.org/can-knowledge/history-of-can-technology",
    "kind": "article",
    "authors": "CAN in Automation (CiA)",
    "venue": "can-cia.org"
  },
  "car-4": {
    "title": "Calculating controller area network (CAN) message response times",
    "url": "https://www.sciencedirect.com/science/article/abs/pii/0967066195001128",
    "kind": "paper",
    "authors": "Ken Tindell, Alan Burns, Andy J. Wellings",
    "year": 1995,
    "venue": "Control Engineering Practice 3(8):1163-1169"
  },
  "car-5": {
    "title": "Ethernet: Distributed Packet Switching for Local Computer Networks",
    "url": "https://www.cs.cornell.edu/courses/cs414/2001FA/papers/ethernet/ethernet.htm",
    "kind": "paper",
    "authors": "Robert M. Metcalfe, David R. Boggs",
    "year": 1976,
    "venue": "Communications of the ACM 19(7):395-404"
  },
  "car-7": {
    "title": "Getting ready for next-generation E/E architecture with zonal compute",
    "url": "https://www.gsaglobal.org/wp-content/uploads/2023/06/2023-June-Final-Report-GSA-McK-Getting-ready-for-next-generation-E_E.pdf",
    "kind": "article",
    "authors": "Global Semiconductor Alliance with Ondrej Burkacky, Johannes Deichmann, Martin Kellner, Fabian Steiner, Julia Werra (McKinsey)",
    "year": 2023,
    "venue": "GSA / McKinsey & Company report, June 2023"
  },
  "car-8": {
    "title": "Overview of Functional Safety Measures in AUTOSAR (AUTOSAR CP R22-11)",
    "url": "https://www.autosar.org/fileadmin/standards/R22-11/CP/AUTOSAR_EXP_FunctionalSafetyMeasures.pdf",
    "kind": "standard",
    "authors": "AUTOSAR",
    "year": 2022,
    "venue": "AUTOSAR Classic Platform R22-11, explanatory document"
  },
  "car-9": {
    "title": "Meet the new R1S and R1T",
    "url": "https://rivian.com/stories/meet-the-new-r1",
    "kind": "article",
    "authors": "Rivian",
    "year": 2024,
    "venue": "rivian.com Stories"
  },
  "car-10": {
    "title": "TMS570LC4357 Hercules Microcontroller Based on the ARM Cortex-R Core (datasheet SPNS195C)",
    "url": "https://www.ti.com/lit/ds/symlink/tms570lc4357.pdf",
    "kind": "datasheet",
    "authors": "Texas Instruments",
    "year": 2016,
    "venue": "TI datasheet SPNS195C, Feb 2014, revised Jun 2016"
  },
  "car-11": {
    "title": "TI Hercules MCUs certified to meet ISO 26262 and IEC 61508 functional safety standards to ASIL D and SIL 3 levels of safety integrity",
    "url": "https://www.ti.com/about-ti/newsroom/news-releases/2014/2014-12-09-ti-hercules--mcus-certified-to-meet-iso-26262-and-iec-61508-functional-safety-standards-to-asil-d-and-sil-3-levels-of-safety-integrity.html",
    "kind": "article",
    "authors": "Texas Instruments",
    "year": 2014,
    "venue": "TI press release, 9 Dec 2014"
  },
  "car-12": {
    "title": "Infineon AURIX Microcontrollers: Intelligent solutions for Automotive & Off-Highway Applications",
    "url": "https://www.infineon.com/assets/row/public/documents/10/43/infineon-aurix-automotive-presentations-en.pdf",
    "kind": "datasheet",
    "authors": "Infineon Technologies",
    "year": 2021,
    "venue": "Infineon product presentation (dated 2021-02-08)"
  },
  "robot-4": {
    "title": "Franka Control Interface (FCI) documentation: Troubleshooting",
    "url": "https://frankarobotics.github.io/docs/troubleshooting.html",
    "kind": "docs",
    "authors": "Franka Robotics",
    "year": 2024,
    "venue": "Vendor documentation"
  },
  "robot-5": {
    "title": "Visually Guided Model Predictive Robot Control via 6D Object Pose Localization and Tracking",
    "url": "https://arxiv.org/abs/2311.05344",
    "kind": "paper",
    "authors": "Mederic Fourmy, Vojtech Priban, Jan Kristof Behrens, Nicolas Mansard, Josef Sivic, Vladimir Petrik",
    "year": 2023,
    "venue": "arXiv:2311.05344"
  },
  "robot-6": {
    "title": "Budget-based real-time Executor for Micro-ROS",
    "url": "https://arxiv.org/abs/2105.05590",
    "kind": "paper",
    "authors": "Jan Staschulat, Ralph Lange, Dakshina Narahari Dasari (Robert Bosch GmbH)",
    "year": 2021,
    "venue": "arXiv:2105.05590 (RTAS 2021 context)"
  },
  "robot-7": {
    "title": "A Robust Layered Control System for a Mobile Robot",
    "url": "https://www.robolabo.etsit.upm.es/asignaturas/irin/papers/Brooks86RobustLayeredControl.pdf",
    "kind": "paper",
    "authors": "Rodney A. Brooks",
    "year": 1986,
    "venue": "IEEE Journal of Robotics and Automation, RA-2(1):14-23"
  },
  "robot-8": {
    "title": "micro-ROS: Features and Architecture",
    "url": "https://micro.vulcanexus.org/docs/overview/features/",
    "kind": "docs",
    "authors": "micro-ROS project (eProsima, Bosch et al.)",
    "year": 2024,
    "venue": "Project documentation"
  },
  "robot-9": {
    "title": "i.MX 8M Mini Applications Processor product page",
    "url": "https://www.nxp.com/products/i.MX8MMINI",
    "kind": "datasheet",
    "authors": "NXP Semiconductors",
    "year": 2024,
    "venue": "Vendor product page"
  },
  "robot-10": {
    "title": "The Worst-Case Execution-Time Problem: Overview of Methods and Survey of Tools",
    "url": "https://www.es.mdh.se/pdf_publications/1258.pdf",
    "kind": "paper",
    "authors": "Reinhard Wilhelm, Jakob Engblom, Andreas Ermedahl, Niklas Holsti, Stephan Thesing, David Whalley, Guillem Bernat, Christian Ferdinand, Reinhold Heckmann, Tulika Mitra, Frank Mueller, Isabelle Puaut, Peter Puschner, Jan Staschulat, Per Stenström",
    "year": 2008,
    "venue": "ACM Transactions on Embedded Computing Systems 7(3), Article 36"
  },
  "robot-11": {
    "title": "Zynq UltraScale+ MPSoC Data Sheet: Overview (DS891)",
    "url": "https://docs.amd.com/v/u/en-US/ds891-zynq-ultrascale-plus-overview",
    "kind": "datasheet",
    "authors": "AMD (Xilinx)",
    "year": 2022,
    "venue": "Vendor datasheet"
  },
  "robot-12": {
    "title": "Measuring the Impact of Interference Channels on Multicore Avionics",
    "url": "https://arxiv.org/abs/2101.02204",
    "kind": "paper",
    "authors": "Steven H. VanderLeest, Samuel R. Thompson",
    "year": 2021,
    "venue": "arXiv:2101.02204"
  },
  "robot-15": {
    "title": "Scheduling Algorithms for Multiprogramming in a Hard-Real-Time Environment",
    "url": "https://www.cs.ru.nl/~hooman/DES/liu-layland.pdf",
    "kind": "paper",
    "authors": "C. L. Liu, James W. Layland",
    "year": 1973,
    "venue": "Journal of the ACM 20(1):46-61"
  },
  "datacenter-1": {
    "title": "The Datacenter as a Computer: Designing Warehouse-Scale Machines, Third Edition",
    "url": "https://doi.org/10.1007/978-3-031-01761-2",
    "kind": "book",
    "authors": "Luiz André Barroso, Urs Hölzle, Parthasarathy Ranganathan",
    "year": 2018,
    "venue": "Synthesis Lectures on Computer Architecture, Morgan & Claypool (now Springer; open access)"
  },
  "datacenter-2": {
    "title": "DRAM Errors in the Wild: A Large-Scale Field Study",
    "url": "https://research.google/pubs/dram-errors-in-the-wild-a-large-scale-field-study/",
    "kind": "paper",
    "authors": "Bianca Schroeder, Eduardo Pinheiro, Wolf-Dietrich Weber",
    "year": 2009,
    "venue": "ACM SIGMETRICS 2009 (Perf. Eval. Rev. 37(1):193-204); CACM 54(2) 2011"
  },
  "datacenter-3": {
    "title": "Error Detecting and Error Correcting Codes",
    "url": "https://doi.org/10.1002/j.1538-7305.1950.tb00463.x",
    "kind": "paper",
    "authors": "R. W. Hamming",
    "year": 1950,
    "venue": "Bell System Technical Journal 29(2):147-160"
  },
  "datacenter-4": {
    "title": "Failure Trends in a Large Disk Drive Population",
    "url": "https://www.usenix.org/legacy/event/fast07/tech/full_papers/pinheiro/pinheiro.pdf",
    "kind": "paper",
    "authors": "Eduardo Pinheiro, Wolf-Dietrich Weber, Luiz André Barroso",
    "year": 2007,
    "venue": "5th USENIX Conference on File and Storage Technologies (FAST '07)"
  },
  "datacenter-5": {
    "title": "Disk failures in the real world: What does an MTTF of 1,000,000 hours mean to you?",
    "url": "https://www.cs.toronto.edu/~bianca/papers/fast07.pdf",
    "kind": "paper",
    "authors": "Bianca Schroeder, Garth A. Gibson",
    "year": 2007,
    "venue": "FAST '07"
  },
  "datacenter-6": {
    "title": "Uptime Institute Global Data Center Survey 2025",
    "url": "https://datacenter.uptimeinstitute.com/rs/711-RIA-145/images/2025.Annual.Survey.Report.pdf",
    "kind": "article",
    "authors": "Uptime Institute (Uptime Intelligence)",
    "year": 2025,
    "venue": "Uptime Institute keynote report"
  },
  "datacenter-7": {
    "title": "Uptime Institute Global Data Center Survey 2026",
    "url": "https://datacenter.uptimeinstitute.com/rs/711-RIA-145/images/UptimeInstitute.GlobalDataCenterSurvey.2026.pdf",
    "kind": "article",
    "authors": "Uptime Institute (Uptime Intelligence)",
    "year": 2026,
    "venue": "Uptime Institute keynote report (survey April-May 2026, published July 2026)"
  },
  "datacenter-8": {
    "title": "The AI Disruption: Challenges and Guidance for Data Center Design (White Paper 110, v1.1)",
    "url": "https://media.datacenterdynamics.com/media/documents/Schneider_Electric_-_Modernization_WP110_V1.1_EN.pdf",
    "kind": "article",
    "authors": "Victor Avelar, Patrick Donovan, Paul Lin, Wendy Torell, Maria A. Torres Arango (Schneider Electric Energy Management Research Center)",
    "year": 2023,
    "venue": "Schneider Electric White Paper 110"
  },
  "datacenter-11": {
    "title": "MapReduce: Simplified Data Processing on Large Clusters",
    "url": "https://research.google/pubs/mapreduce-simplified-data-processing-on-large-clusters/",
    "kind": "paper",
    "authors": "Jeffrey Dean, Sanjay Ghemawat",
    "year": 2004,
    "venue": "OSDI '04 (also CACM 51(1):107-113, 2008)"
  },
  "datacenter-12": {
    "title": "Validity of the single processor approach to achieving large scale computing capabilities",
    "url": "https://doi.org/10.1145/1465482.1465560",
    "kind": "paper",
    "authors": "Gene M. Amdahl",
    "year": 1967,
    "venue": "AFIPS Spring Joint Computer Conference, pp. 483-485"
  },
  "datacenter-13": {
    "title": "Reevaluating Amdahl's Law",
    "url": "https://doi.org/10.1145/42411.42415",
    "kind": "paper",
    "authors": "John L. Gustafson",
    "year": 1988,
    "venue": "Communications of the ACM 31(5):532-533"
  },
  "datacenter-14": {
    "title": "The Tail at Scale",
    "url": "https://research.google/pubs/the-tail-at-scale/",
    "kind": "paper",
    "authors": "Jeffrey Dean, Luiz André Barroso",
    "year": 2013,
    "venue": "Communications of the ACM 56(2):74-80"
  },
  "datacenter-15": {
    "title": "Power usage effectiveness (Google data centers efficiency)",
    "url": "https://datacenters.google/efficiency/",
    "kind": "docs",
    "authors": "Google",
    "year": 2026,
    "venue": "datacenters.google"
  },
  "datacenter-16": {
    "title": "PUE: A Comprehensive Examination of the Metric (White Paper #49)",
    "url": "https://datacenters.lbl.gov/sites/default/files/WP49-PUE%20A%20Comprehensive%20Examination%20of%20the%20Metric_v6.pdf",
    "kind": "standard",
    "authors": "The Green Grid; eds. Victor Avelar, Dan Azevedo, Alan French",
    "year": 2012,
    "venue": "The Green Grid"
  },
  "datacenter-17": {
    "title": "2024 United States Data Center Energy Usage Report",
    "url": "https://eta-publications.lbl.gov/sites/default/files/2024-12/lbnl-2024-united-states-data-center-energy-usage-report_1.pdf",
    "kind": "article",
    "authors": "Arman Shehabi, Sarah J. Smith, Alex Hubbard, Alexander Newkirk, Nuoa Lei, Md AbuBakar Siddik, Billie Holecek, Jonathan Koomey, Eric Masanet, Dale Sartor",
    "year": 2024,
    "venue": "Lawrence Berkeley National Laboratory"
  },
  "datacenter-18": {
    "title": "Christian Belady (people page)",
    "url": "https://www.mainspringenergy.com/people/christian-belady",
    "kind": "article",
    "authors": "Mainspring Energy",
    "year": 2025,
    "venue": "mainspringenergy.com"
  },
  "extremes-3": {
    "title": "Single Event Effects Specification (draft)",
    "url": "https://nepp.nasa.gov/DocUploads/074CCC9D-51FB-4323-AB81F47E8F06FFDB/DraftSingleEventEffectSpecification.pdf",
    "kind": "standard",
    "authors": "Kenneth A. LaBel (NASA GSFC)",
    "year": 1996,
    "venue": "NASA Electronic Parts and Packaging (NEPP)"
  },
  "extremes-4": {
    "title": "Single Event Effect Criticality Analysis (SEECA)",
    "url": "https://nepp.nasa.gov/docuploads/6D728AF0-2817-4530-97555B6DCB26D083/seecai.pdf",
    "kind": "standard",
    "authors": "K. A. LaBel, M. M. Gates, J. L. Barth (NASA GSFC), A. Johnston (JPL), P. Marshall",
    "year": 1996,
    "venue": "NASA Headquarters Code QW"
  },
  "extremes-5": {
    "title": "Soft Errors in Advanced Computer Systems",
    "url": "https://www.cs.columbia.edu/~cs4823/handouts/baumann-soft-errors-DT-05.pdf",
    "kind": "paper",
    "authors": "Robert Baumann (Texas Instruments)",
    "year": 2005,
    "venue": "IEEE Design & Test of Computers 22(3):258–266"
  },
  "extremes-6": {
    "title": "Impact of Scaling on Neutron-Induced Soft Error in SRAMs From a 250 nm to a 22 nm Design Rule",
    "url": "https://webhost.laas.fr/TSF/WDSN09/WDSN09_files/Texts/WDSN09-2-1-Ibe.pdf",
    "kind": "paper",
    "authors": "E. Ibe, H. Taniguchi, Y. Yahagi, K. Shimbo, T. Toba",
    "year": 2010,
    "venue": "IEEE Transactions on Electron Devices 57(7):1527–1538"
  },
  "extremes-7": {
    "title": "The Use of Triple-Modular Redundancy to Improve Computer Reliability",
    "url": "http://bitsavers.informatik.uni-stuttgart.de/pdf/ibm/IBM_Journal_of_Research_and_Development/062/ibmrd0602F.pdf",
    "kind": "paper",
    "authors": "R. E. Lyons, W. Vanderkulk",
    "year": 1962,
    "venue": "IBM Journal of Research and Development 6(2):200–209"
  },
  "extremes-8": {
    "title": "Probabilistic Logics and the Synthesis of Reliable Organisms From Unreliable Components",
    "url": "https://static.ias.edu/pitp/archive/2012files/Probabilistic_Logics.pdf",
    "kind": "book",
    "authors": "John von Neumann",
    "year": 1956,
    "venue": "Automata Studies (Annals of Mathematics Studies 34), eds. C. E. Shannon & J. McCarthy, Princeton University Press, pp. 43–98"
  },
  "extremes-10": {
    "title": "Radiation-hardened electronics",
    "url": "https://www.baesystems.com/en-us/product/radiation-hardened-electronics",
    "kind": "docs",
    "authors": "BAE Systems",
    "venue": "BAE Systems website"
  },
  "extremes-11": {
    "title": "Perseverance Rover Components",
    "url": "https://science.nasa.gov/mission/mars-2020-perseverance/rover-components/",
    "kind": "docs",
    "authors": "NASA Science",
    "venue": "science.nasa.gov"
  },
  "extremes-12": {
    "title": "Learn About Me: Curiosity",
    "url": "https://mars.nasa.gov/multimedia/interactives/learncuriosity/index-2.html",
    "kind": "docs",
    "authors": "NASA/JPL",
    "venue": "mars.nasa.gov"
  },
  "extremes-14": {
    "title": "Can Programming Be Liberated from the von Neumann Style? A Functional Style and Its Algebra of Programs (1977 ACM Turing Award Lecture)",
    "url": "https://worrydream.com/refs/Backus_1978_-_Can_Programming_Be_Liberated_from_the_von_Neumann_Style.pdf",
    "kind": "paper",
    "authors": "John Backus",
    "year": 1978,
    "venue": "Communications of the ACM 21(8):613–641"
  },
  "extremes-15": {
    "title": "Advancing Neuromorphic Computing With Loihi: A Survey of Results and Outlook",
    "url": "https://dynamicfieldtheory.org/upload/file/1631291311_c647b66b9e48f0a9baff/DavisEtAl2021.pdf",
    "kind": "paper",
    "authors": "M. Davies, A. Wild, G. Orchard, Y. Sandamirskaya, G. A. Fonseca Guerra, P. Joshi, P. Plank, S. R. Risbud",
    "year": 2021,
    "venue": "Proceedings of the IEEE 109(5):911–934"
  },
  "extremes-16": {
    "title": "Intel Builds World's Largest Neuromorphic System to Enable More Sustainable AI",
    "url": "https://www.intel.com/content/www/us/en/newsroom/news/intel-builds-worlds-largest-neuromorphic-system.html",
    "kind": "article",
    "authors": "Intel Newsroom",
    "year": 2024,
    "venue": "Intel press release, 17 Apr 2024"
  },
  "extremes-17": {
    "title": "IBM Research's new NorthPole AI chip",
    "url": "https://research.ibm.com/blog/northpole-ibm-ai-chip",
    "kind": "article",
    "authors": "Mike Murphy, IBM Research",
    "year": 2023,
    "venue": "IBM Research blog, 19 Oct 2023"
  },
  "extremes-18": {
    "title": "NorthPole: Neural Inference at the Frontier of Energy, Space, and Time",
    "url": "https://modha.org/2023/10/northpole-neural-inference-at-the-frontier-of-energy-space-and-time/",
    "kind": "article",
    "authors": "Dharmendra S. Modha",
    "year": 2023,
    "venue": "modha.org"
  },
  "extremes-19": {
    "title": "Algorithms for quantum computation: discrete logarithms and factoring",
    "url": "https://arxiv.org/abs/quant-ph/9508027",
    "kind": "paper",
    "authors": "Peter W. Shor",
    "year": 1994,
    "venue": "Proc. 35th Annual Symposium on Foundations of Computer Science (FOCS), pp. 124–134"
  },
  "extremes-20": {
    "title": "A fast quantum mechanical algorithm for database search",
    "url": "https://arxiv.org/abs/quant-ph/9605043",
    "kind": "paper",
    "authors": "Lov K. Grover",
    "year": 1996,
    "venue": "Proc. 28th ACM STOC, pp. 212–219"
  },
  "extremes-21": {
    "title": "Engineering cryogenic setups for 100-qubit scale superconducting circuit systems",
    "url": "https://arxiv.org/abs/1806.07862",
    "kind": "paper",
    "authors": "S. Krinner, S. Storz, P. Kurpiers, P. Magnard, J. Heinsoo, R. Keller, J. Luetolf, C. Eichler, A. Wallraff",
    "year": 2019,
    "venue": "EPJ Quantum Technology 6:2"
  },
  "extremes-23": {
    "title": "The Temperature of the Cosmic Microwave Background",
    "url": "https://arxiv.org/abs/0911.1955",
    "kind": "paper",
    "authors": "D. J. Fixsen",
    "year": 2009,
    "venue": "The Astrophysical Journal 707(2):916–920"
  },
  "implant-1": {
    "title": "An Integrated Brain-Machine Interface Platform With Thousands of Channels",
    "url": "https://www.jmir.org/2019/10/e16194/",
    "kind": "paper",
    "authors": "Elon Musk; Neuralink",
    "year": 2019,
    "venue": "Journal of Medical Internet Research 21(10):e16194"
  },
  "implant-2": {
    "title": "PRIME Study Progress Update",
    "url": "https://neuralink.com/blog/prime-study-progress-update/",
    "kind": "article",
    "authors": "Neuralink",
    "year": 2024,
    "venue": "Neuralink blog, April 12, 2024"
  },
  "implant-3": {
    "title": "PRIME Study brochure (Precise Robotically Implanted Brain-Computer Interface)",
    "url": "https://neuralink.com/pdfs/PRIME-Study-Brochure.pdf",
    "kind": "docs",
    "authors": "Neuralink",
    "year": 2023,
    "venue": "Neuralink (PDF)"
  },
  "implant-4": {
    "title": "Neuralink Compression Challenge (README)",
    "url": "https://web.archive.org/web/20250901131704/https://content.neuralink.com/compression-challenge/README.html",
    "kind": "docs",
    "authors": "Neuralink",
    "year": 2024,
    "venue": "content.neuralink.com"
  },
  "implant-5": {
    "title": "A 1024-Channel Simultaneous Recording Neural SoC with Stimulation and Real-Time Spike Detection",
    "url": "https://ieeexplore.ieee.org/document/9492480/",
    "kind": "paper",
    "authors": "Do-Yeon Yoon, Sonal Pinto, SungWon Chung, Paul Merolla, Thong-Wei Koh, Dongjin Seo (Neuralink)",
    "year": 2021,
    "venue": "2021 Symposium on VLSI Circuits"
  },
  "implant-6": {
    "title": "SCALO: An Accelerator-Rich Distributed System for Scalable Brain-Computer Interfacing",
    "url": "https://www.anuragkhandelwal.com/papers/scalo.pdf",
    "kind": "paper",
    "authors": "Karthik Sriram, Raghavendra Pradyumna Pothukuchi, Michal Gerasimiuk, Muhammed Ugur, Oliver Ye, Rajit Manohar, Anurag Khandelwal, Abhishek Bhattacharjee",
    "year": 2023,
    "venue": "ISCA '23 (50th International Symposium on Computer Architecture)"
  },
  "implant-9": {
    "title": "MINDFUL: Safe, Implantable, Large-Scale Brain-Computer Interfaces from a System-Level Design Perspective",
    "url": "https://bioee.ee.columbia.edu/wp-content/uploads/2025/10/3725843.3756032.pdf",
    "kind": "paper",
    "authors": "Guy Eichler, Yatin Gilhotra, Nanyu Zeng, Martha Kim, Kenneth Shepard, Luca Carloni",
    "year": 2025,
    "venue": "MICRO '25 (58th IEEE/ACM International Symposium on Microarchitecture)"
  },
  "implant-10": {
    "title": "Thermal Impact of an Active 3-D Microelectrode Array Implanted in the Brain",
    "url": "https://doi.org/10.1109/TNSRE.2007.908429",
    "kind": "paper",
    "authors": "Sohee Kim, Prashant Tathireddy, Richard A. Normann, Florian Solzbacher",
    "year": 2007,
    "venue": "IEEE Transactions on Neural Systems and Rehabilitation Engineering 15(4):493-501"
  },
  "implant-11": {
    "title": "Neuralink's First User Describes Life with Elon Musk's Brain Chip",
    "url": "https://www.scientificamerican.com/article/neuralinks-first-user-describes-life-with-elon-musks-brain-chip/",
    "kind": "article",
    "authors": "Scientific American",
    "year": 2024,
    "venue": "Scientific American, June 7, 2024"
  },
  "implant-13": {
    "title": "Neuronal ensemble control of prosthetic devices by a human with tetraplegia",
    "url": "https://doi.org/10.1038/nature04970",
    "kind": "paper",
    "authors": "Leigh R. Hochberg, Mijail D. Serruya, Gerhard M. Friehs, Jon A. Mukand, Maryam Saleh, Abraham H. Caplan, et al. (senior author John P. Donoghue)",
    "year": 2006,
    "venue": "Nature 442:164-171"
  },
  "edge-f1": {
    "title": "User Mode Overview (Zephyr Project documentation)",
    "url": "https://docs.zephyrproject.org/latest/kernel/usermode/overview.html",
    "kind": "docs",
    "authors": "Zephyr Project",
    "year": 2026,
    "venue": "docs.zephyrproject.org"
  },
  "extremes-f2": {
    "title": "Mars Communications Disruption and Delay",
    "url": "https://www.lpi.usra.edu/lunar/strategies/resources/M2M-ACR2023_MarsCommunicationDisruptionDelay.pdf",
    "kind": "docs",
    "authors": "NASA",
    "year": 2023,
    "venue": "2023 Moon to Mars Architecture Concept Review"
  },
  "extremes-f3": {
    "title": "RAD750 radiation-hardened PowerPC microprocessor (datasheet)",
    "url": "https://www.baesystems.com/en-us/dam/jcr:c297f318-c618-4015-9399-adf76ac5cf55/16-f78-RAD750-Component-datasheet-2025-web.pdf",
    "kind": "datasheet",
    "authors": "BAE Systems",
    "year": 2025,
    "venue": "BAE Systems"
  },
  "extremes-f4": {
    "title": "IBM cools down world's largest quantum-ready cryostat",
    "url": "https://www.ibm.com/quantum/blog/goldeneye-cryogenic-concept-system",
    "kind": "article",
    "authors": "IBM Quantum",
    "year": 2022,
    "venue": "IBM Quantum blog"
  },
  "fab-f5": {
    "title": "Mechanics & mechatronics",
    "url": "https://www.asml.com/en/technology/lithography-principles/mechanics-and-mechatronics",
    "kind": "docs",
    "authors": "ASML",
    "venue": "asml.com"
  },
  "fab-f6": {
    "title": "3 nm process",
    "url": "https://en.wikipedia.org/wiki/3_nm_process",
    "kind": "article",
    "authors": "Wikipedia contributors",
    "venue": "Wikipedia"
  },
  "implant-f7": {
    "title": "ISO 14708-1:2000 Implants for surgery — Active implantable medical devices — Part 1: General requirements for safety, marking and for information to be provided by the manufacturer",
    "url": "https://archive.org/stream/gov.in.is.iso.14708.1.2000/is.iso.14708.1.2000_djvu.txt",
    "kind": "standard",
    "authors": "ISO",
    "year": 2000,
    "venue": "International standard (as adopted in IS/ISO 14708-1)"
  },
  "implant-f8": {
    "title": "Power Budget of a Skull Unit in a Fully-Implantable Brain-Computer Interface: Bio-Heat Model",
    "url": "https://doi.org/10.1109/TNSRE.2023.3323916",
    "kind": "paper",
    "authors": "Christian Serrano-Amenos; Payam Heydari; Charles Y. Liu; An H. Do; Zoran Nenadic",
    "year": 2023,
    "venue": "IEEE Transactions on Neural Systems and Rehabilitation Engineering"
  },
  "implant-f9": {
    "title": "PRIME Study Progress Update — User Experience",
    "url": "https://neuralink.com/blog/prime-study-progress-update-user-experience/",
    "kind": "article",
    "authors": "Neuralink",
    "year": 2024,
    "venue": "Neuralink blog"
  },
  "memory-f10": {
    "title": "16Gb DDR5 SDRAM Die Rev D addendum",
    "url": "https://mm.digikey.com/Volume0/opasdata/d220001/medias/docus/7969/16gb-ddr5-sdram-dierevd.pdf",
    "kind": "datasheet",
    "authors": "Micron Technology",
    "year": 2021,
    "venue": "Micron datasheet"
  },
  "memory-f11": {
    "title": "Performance Analysis of HPC Applications on the Aurora Supercomputer: Exploring the Impact of HBM-Enabled Intel Xeon Max CPUs",
    "url": "https://arxiv.org/abs/2504.03632",
    "kind": "paper",
    "authors": "Huda Ibeid et al.",
    "year": 2025,
    "venue": "arXiv:2504.03632"
  },
  "phone-f12": {
    "title": "Apple debuts iPhone 16 Pro and iPhone 16 Pro Max",
    "url": "https://www.apple.com/newsroom/2024/09/apple-debuts-iphone-16-pro-and-iphone-16-pro-max/",
    "kind": "article",
    "authors": "Apple Newsroom",
    "year": 2024,
    "venue": "apple.com"
  },
  "phone-f13": {
    "title": "MediaTek Dimensity 9300",
    "url": "https://www.mediatek.com/products/smartphones-2/mediatek-dimensity-9300",
    "kind": "datasheet",
    "authors": "MediaTek",
    "year": 2023,
    "venue": "mediatek.com"
  },
  "phone-f14": {
    "title": "Apple unveils iPhone 17 Pro and iPhone 17 Pro Max",
    "url": "https://www.apple.com/newsroom/2025/09/apple-unveils-iphone-17-pro-and-iphone-17-pro-max/",
    "kind": "article",
    "authors": "Apple Newsroom",
    "year": 2025,
    "venue": "apple.com"
  },
  "robot-f15": {
    "title": "Cascaded position control for servo drives explained",
    "url": "https://www.synapticon.com/en/motion-control-academy/kaskadierte-positionsregelung",
    "kind": "docs",
    "authors": "Synapticon",
    "year": 2024,
    "venue": "Synapticon Motion Control Academy"
  },
  "time-f16": {
    "title": "The Optimal Logic Depth Per Pipeline Stage is 6 to 8 FO4 Inverter Delays",
    "url": "https://www.cs.utexas.edu/~skeckler/pubs/isca02.pdf",
    "kind": "paper",
    "authors": "M. S. Hrishikesh, Norman P. Jouppi, Keith I. Farkas, Doug Burger, Stephen W. Keckler, Premkishore Shivakumar",
    "year": 2002,
    "venue": "ISCA 2002"
  },
  "time-f17": {
    "title": "Intel kills 4GHz P4",
    "url": "https://www.theregister.com/2004/10/14/intel_kills_4gh/",
    "kind": "article",
    "authors": "The Register",
    "year": 2004,
    "venue": "The Register"
  },
  "time-f18": {
    "title": "Intel Core i9 processor 14900KS Specifications",
    "url": "https://www.intel.com/content/www/us/en/products/sku/237504/intel-core-i9-processor-14900ks-36m-cache-up-to-6-20-ghz/specifications.html",
    "kind": "datasheet",
    "authors": "Intel",
    "year": 2024,
    "venue": "Intel ARK"
  }
}

export const citations: Record<string, Record<string, Citation[]>> = {
  "chip": {
    "whole": [
      {
        "at": "This is a desktop processor as it ships: a square of green fibreglass with a metal lid soldered on top and a thousand gold contacts underneath",
        "refs": [
          "chip-1",
          "chip-2",
          "chip-5"
        ]
      }
    ],
    "lid": [
      {
        "at": "The integrated heat spreader is a nickel-plated copper plate",
        "refs": [
          "chip-2",
          "chip-4"
        ]
      },
      {
        "at": "That is a heat flux higher than a kitchen hotplate",
        "refs": [
          "chip-3"
        ]
      },
      {
        "at": "A desktop chip is only rated to run up to about 100°C",
        "refs": [
          "chip-1"
        ]
      }
    ],
    "die": [
      {
        "at": "Underneath is the die: a single crystal of silicon with billions of switches printed onto its surface in layers",
        "refs": [
          "chip-6",
          "chip-23"
        ]
      }
    ],
    "substrate": [
      {
        "at": "Under it sit the contacts — over a thousand on a modern chip",
        "refs": [
          "chip-1"
        ]
      },
      {
        "at": "Roughly half of the pins on a CPU do nothing but deliver current",
        "refs": [
          "chip-4"
        ]
      }
    ],
    "exploded": [
      {
        "at": "Lid, thermal interface, die, capacitors, substrate, contacts, socket",
        "refs": [
          "chip-2"
        ]
      }
    ],
    "cache": [
      {
        "at": "At these speeds that round trip costs the core hundreds of wasted cycles — long enough to have executed hundreds of instructions instead",
        "refs": [
          "chip-7"
        ]
      },
      {
        "at": "a few dozen kilobytes right beside the core",
        "refs": [
          "memory-11"
        ]
      },
      {
        "at": "L1 hit: ~1 nanosecond. Main memory: ~80 nanoseconds",
        "refs": [
          "chip-7",
          "chip-8"
        ]
      }
    ],
    "arrive": [
      {
        "at": "Keep magnifying a core and the blocks dissolve into wires, and the wires end at this: a single field-effect transistor",
        "refs": [
          "chip-9",
          "chip-11"
        ]
      },
      {
        "at": "There are billions of these on the die you were just looking at",
        "refs": [
          "chip-6"
        ]
      }
    ],
    "parts": [
      {
        "at": "Above that gap sits the gate, separated by an insulating layer only a few atoms thick",
        "refs": [
          "chip-12"
        ]
      },
      {
        "at": "It works purely by the field it projects",
        "refs": [
          "chip-9",
          "chip-11"
        ]
      }
    ],
    "switching": [
      {
        "at": "since 2007 it has been made of hafnium oxide",
        "refs": [
          "chip-12"
        ]
      }
    ],
    "logic": [
      {
        "at": "Wire two complementary transistors in series and you get an inverter: in goes 1, out comes 0",
        "refs": [
          "chip-13",
          "chip-14"
        ]
      }
    ],
    "fpga": [
      {
        "at": "Every block here is a small lookup table that can be told to behave as any gate, and the channels between them are switches deciding what connects to what",
        "refs": [
          "chip-15"
        ]
      },
      {
        "at": "Configurable means slower and hungrier than fixed silicon doing the same job",
        "refs": [
          "chip-16"
        ]
      }
    ],
    "asic": [
      {
        "at": "It is faster and cooler than the FPGA doing the identical job — and it can never do any other job as long as it exists",
        "refs": [
          "chip-16"
        ]
      }
    ],
    "cpu": [
      {
        "at": "It costs enormously",
        "refs": [
          "chip-17"
        ]
      }
    ],
    "gpu": [
      {
        "at": "one instruction applied to every lane of a group at once (Nvidia's groups are 32 lanes wide)",
        "refs": [
          "chip-18"
        ]
      },
      {
        "at": "If the lanes need to do different things, they take turns",
        "refs": [
          "chip-18"
        ]
      }
    ],
    "tensor": [
      {
        "at": "The bright tiles are tensor cores: fixed units that multiply a small matrix in one instruction, dropped in among ordinary lanes",
        "refs": [
          "chip-19"
        ]
      },
      {
        "at": "Nvidia calls them tensor cores; Google calls its equivalent an MXU",
        "refs": [
          "chip-20"
        ]
      }
    ],
    "npu": [
      {
        "at": "An NPU or TPU is an ASIC again — the same bargain as three beats ago, now struck for exactly one job: multiplying matrices",
        "refs": [
          "chip-21",
          "chip-20"
        ]
      },
      {
        "at": "This is a systolic array",
        "refs": [
          "chip-21",
          "chip-20"
        ]
      },
      {
        "at": "Weights are loaded in from one edge and then held in place",
        "refs": [
          "chip-21"
        ]
      },
      {
        "at": "Give up everything else and the same silicon area does one job on a fraction of the power",
        "refs": [
          "chip-21"
        ]
      }
    ]
  },
  "memory": {
    "latch": [
      {
        "at": "Two NOR gates, each one feeding the other's input",
        "refs": [
          "memory-1"
        ]
      }
    ],
    "flipflop": [
      {
        "at": "So pair two of them and gate each on opposite halves of a clock — the first listens while the second holds, then they swap",
        "refs": [
          "memory-1"
        ]
      }
    ],
    "sram": [
      {
        "at": "Build that same loop out of transistors rather than drawn gates and you get an SRAM cell: two inverters facing each other, plus two more transistors that let the bit lines in when the row is selected",
        "refs": [
          "memory-3"
        ]
      },
      {
        "at": "It is fast, it holds its value as long as the power is on, and it is expensive in the only currency a chip has — area",
        "refs": [
          "memory-3",
          "memory-8"
        ]
      }
    ],
    "dram": [
      {
        "at": "One transistor and one capacitor: charge the capacitor for a 1, drain it for a 0, and use the transistor as the tap",
        "refs": [
          "memory-4",
          "memory-5"
        ]
      },
      {
        "at": "The catch is that a capacitor this small does not hold its charge",
        "refs": [
          "memory-4",
          "memory-7"
        ]
      },
      {
        "at": "In DDR5, every cell is read and rewritten every 32 ms",
        "refs": [
          "memory-f10"
        ]
      }
    ],
    "array": [
      {
        "at": "The same patch of silicon holds a handful of SRAM cells or a great many DRAM cells, and that ratio is why your machine has megabytes of one and gigabytes of the other",
        "refs": [
          "memory-8"
        ]
      }
    ],
    "ladder": [
      {
        "at": "Everything close by is small, everything vast is far away, and nothing is both",
        "refs": [
          "chip-7"
        ]
      }
    ],
    "l1": [
      {
        "at": "The tiers between the core and main memory are all the same idea: keep a copy of what was just used, because programs overwhelmingly ask for the same things again, and for their neighbours",
        "refs": [
          "memory-10",
          "memory-9"
        ]
      },
      {
        "at": "That is the whole bet, and it is not obviously true — it is a property of how real programs behave, not of arithmetic",
        "refs": [
          "memory-10"
        ]
      }
    ],
    "ram": [
      {
        "at": "seventy to a hundred nanoseconds away",
        "refs": [
          "chip-7"
        ]
      },
      {
        "at": "At four billion cycles a second that is hundreds of cycles the core spends doing nothing at all",
        "refs": [
          "chip-7",
          "memory-11"
        ]
      }
    ],
    "hbm": [
      {
        "at": "The memory does not become quicker silicon, and it does not move along the axis",
        "refs": [
          "memory-12"
        ]
      },
      {
        "at": "It is bandwidth, not latency",
        "refs": [
          "memory-f11"
        ]
      }
    ],
    "unified": [
      {
        "at": "That copy is often more expensive than the arithmetic it was for",
        "refs": [
          "memory-15"
        ]
      },
      {
        "at": "Put both over one pool and the copy simply is not there any more",
        "refs": [
          "memory-14"
        ]
      }
    ],
    "wear": [
      {
        "at": "Forcing charge through an insulator damages it a little every time",
        "refs": [
          "memory-20",
          "memory-22"
        ]
      },
      {
        "at": "So a drive quietly spreads writes across cells that have been used least, and retires the ones that have died",
        "refs": [
          "memory-21",
          "memory-20"
        ]
      }
    ],
    "whole": [
      {
        "at": "light only moves so far per tick",
        "refs": [
          "memory-24"
        ]
      }
    ],
    "ssd": [
      {
        "at": "so it can only leak away very slowly",
        "refs": [
          "memory-20"
        ]
      }
    ]
  },
  "time": {
    "clock": [
      {
        "at": "Wire millions of them to the same signal and the whole machine becomes a thing that changes in steps rather than continuously",
        "refs": [
          "time-5"
        ]
      }
    ],
    "stages": [
      {
        "at": "Write the answer back",
        "refs": [
          "time-4"
        ]
      },
      {
        "at": "Do them one instruction at a time and four fifths of the machine is idle at every moment — which is exactly what the next chapter refuses to accept",
        "refs": [
          "time-4"
        ]
      }
    ],
    "overlap": [
      {
        "at": "Hand it the next instruction immediately, and the one after that to the stage behind, until every stage is busy on a different instruction",
        "refs": [
          "time-4",
          "time-7"
        ]
      },
      {
        "at": "Pipelining does not make one instruction faster",
        "refs": [
          "time-4"
        ]
      }
    ],
    "hazard": [
      {
        "at": "The pipeline inserts a bubble — an empty slot — and lets it move along",
        "refs": [
          "time-4"
        ]
      },
      {
        "at": "Every one of them is a tick where a stage did no work, and the machine cannot get that tick back",
        "refs": [
          "time-4"
        ]
      }
    ],
    "branch": [
      {
        "at": "A conditional jump is worse than a stall, because the machine does not know what to fetch next until the condition has been evaluated — several stages later",
        "refs": [
          "time-4"
        ]
      }
    ],
    "speculation": [
      {
        "at": "The processor predicts which way the branch will go and carries on as if it were certain",
        "refs": [
          "time-4",
          "time-8"
        ]
      },
      {
        "at": "When the branch resolves and the guess was wrong, every speculative instruction is discarded",
        "refs": [
          "time-4",
          "time-3"
        ]
      },
      {
        "at": "a deep modern core can discard around a fifth of the instructions it executes",
        "refs": [
          "time-3"
        ]
      }
    ],
    "depth": [
      {
        "at": "which was about half of how clock speeds climbed; faster transistors were the other half",
        "refs": [
          "time-f16"
        ]
      },
      {
        "at": "But the deeper the pipeline, the longer until the branch resolves, and the more speculative work is in flight to be thrown away when it does",
        "refs": [
          "time-4",
          "time-3"
        ]
      }
    ],
    "wall": [
      {
        "at": "Frequency is linear — but for decades, pushing frequency meant pushing voltage too, and that term is squared",
        "refs": [
          "time-10"
        ]
      },
      {
        "at": "broke down in the mid-2000s",
        "refs": [
          "time-3"
        ]
      },
      {
        "at": "Intel cancelled a 4 GHz part in 2004, largely over this",
        "refs": [
          "time-f17"
        ]
      },
      {
        "at": "top boost clocks have crept only from 3.8 GHz to about 6.2",
        "refs": [
          "time-f18"
        ]
      }
    ],
    "cores": [
      {
        "at": "A faster clock sped up every program ever written; more cores only help programs that can be split — and most of the interesting ones cannot be, entirely",
        "refs": [
          "time-12",
          "time-3"
        ]
      },
      {
        "at": "This is why they exist anyway: not because parallelism was desirable, but because frequency was no longer available",
        "refs": [
          "time-14",
          "time-3"
        ]
      }
    ]
  },
  "fab": {
    "wafer": [
      {
        "at": "Sand becomes silicon, silicon becomes a single cylindrical crystal grown from a seed, and that crystal is sliced into discs and polished until they are flatter than almost anything else people manufacture",
        "refs": [
          "fab-2",
          "fab-1",
          "fab-3"
        ]
      },
      {
        "at": "This is the blank — and the notch cut into its edge is there so a machine can tell which way round the crystal is",
        "refs": [
          "fab-4"
        ]
      }
    ],
    "dies": [
      {
        "at": "One wafer carries many copies of one design, tiled edge to edge",
        "refs": [
          "fab-8",
          "fab-6"
        ]
      }
    ],
    "expose": [
      {
        "at": "Wherever light landed, the chemical is now different, and a wash removes one kind and leaves the other",
        "refs": [
          "fab-6",
          "fab-8"
        ]
      },
      {
        "at": "sweeping a narrow slit of light across the field in a fraction of a second",
        "refs": [
          "fab-f5"
        ]
      }
    ],
    "stepper": [
      {
        "at": "So the machine steps: expose, move, expose, move — across the entire disc",
        "refs": [
          "fab-8",
          "fab-6"
        ]
      },
      {
        "at": "landing each layer on the one beneath within a nanometre or two",
        "refs": [
          "fab-13"
        ]
      },
      {
        "at": "comes back to this machine dozens of times before it is finished",
        "refs": [
          "fab-18"
        ]
      }
    ],
    "euv": [
      {
        "at": "Light cannot easily print finer than its wavelength, and for years that meant 193 nm deep ultraviolet",
        "refs": [
          "fab-10",
          "fab-11",
          "fab-16"
        ]
      },
      {
        "at": "water between lens and wafer stretched it to the 7 nm generation",
        "refs": [
          "fab-14",
          "fab-15"
        ]
      },
      {
        "at": "Then came extreme ultraviolet: 13.5 nm, from laser-struck droplets of molten tin",
        "refs": [
          "fab-11"
        ]
      },
      {
        "at": "Air and glass absorb it, so the optics are mirrors in a vacuum",
        "refs": [
          "fab-12"
        ]
      },
      {
        "at": "only one company builds the machines",
        "refs": [
          "fab-12"
        ]
      }
    ],
    "layers": [
      {
        "at": "A finished chip is a stack of them: the transistors at the bottom, and above them layer after layer of metal wiring connecting everything to everything",
        "refs": [
          "fab-16",
          "fab-17"
        ]
      },
      {
        "at": "Every layer must line up with the one beneath it to within a small fraction of a feature",
        "refs": [
          "fab-13"
        ]
      },
      {
        "at": "A leading-edge chip takes around eighty prints",
        "refs": [
          "fab-18"
        ]
      }
    ],
    "yield": [
      {
        "at": "Yield is simply the fraction that survived, and it dominates the economics",
        "refs": [
          "fab-19"
        ]
      },
      {
        "at": "That is much of the argument for chiplets",
        "refs": [
          "fab-19"
        ]
      }
    ],
    "bins": [
      {
        "at": "Test every die that works and they will not match",
        "refs": [
          "fab-20"
        ]
      },
      {
        "at": "The best become the expensive part, the ones with a dead core get it switched off and are sold as a smaller model, and the rest fill in between",
        "refs": [
          "fab-21"
        ]
      }
    ],
    "node": [
      {
        "at": "They came apart in the mid-1990s, when gates were shrunk faster than everything else: a 130 nm process already had gates nearer 70",
        "refs": [
          "fab-22"
        ]
      },
      {
        "at": "A part sold as \"3 nm\" has gates spaced about 45 nanometres apart and its finest wires at a pitch of about 23",
        "refs": [
          "fab-f6"
        ]
      },
      {
        "at": "The number is marketing",
        "refs": [
          "fab-22",
          "fab-23"
        ]
      }
    ]
  },
  "board": {
    "pcb": [
      {
        "at": "It is woven glass fibre soaked in epoxy, with sheets of copper laminated between the layers — eight, ten, sometimes more than a dozen of them stacked up",
        "refs": [
          "board-3",
          "board-4"
        ]
      },
      {
        "at": "Close to half of those layers are not signals",
        "refs": [
          "board-4"
        ]
      },
      {
        "at": "They are solid planes of copper carrying power and ground, and they exist as much to give every signal a clean path back as to deliver current",
        "refs": [
          "board-5"
        ]
      },
      {
        "at": "Nothing about the material is green",
        "refs": [
          "board-3"
        ]
      }
    ],
    "traces": [
      {
        "at": "At the speeds these run, a trace is not a neutral connection between two points — it is a delay, and a length that has to be accounted for",
        "refs": [
          "board-5",
          "board-6"
        ]
      },
      {
        "at": "A signal covers roughly 15 cm per nanosecond in a board",
        "refs": [
          "board-5"
        ]
      }
    ],
    "battery": [
      {
        "at": "It supplies something around eleven or twelve volts",
        "refs": [
          "board-10"
        ]
      }
    ],
    "vrm": [
      {
        "at": "It wants roughly one, held very steady, and it wants a great deal of current at that voltage",
        "refs": [
          "board-9"
        ]
      },
      {
        "at": "The chunky metal cubes are inductors, and they are among the biggest components on the board because turning volts into amps efficiently requires storing energy in a magnetic field, and that takes physical bulk",
        "refs": [
          "board-11"
        ]
      },
      {
        "at": "The regulators for a performance laptop processor are built to deliver over a hundred amps at about a volt",
        "refs": [
          "board-9"
        ]
      }
    ],
    "rails": [
      {
        "at": "Half the pins on the chip were power and ground",
        "refs": [
          "board-9"
        ]
      },
      {
        "at": "Close to half the layers in the board are power and ground",
        "refs": [
          "board-5"
        ]
      }
    ],
    "ddr": [
      {
        "at": "every extra centimetre is delay that has to be matched on every other wire in the group",
        "refs": [
          "board-6"
        ]
      },
      {
        "at": "These same wires carry both reads and writes, so the bus can only do one at a time — and it goes completely still while it turns around",
        "refs": [
          "board-7"
        ]
      },
      {
        "at": "That pause is why a workload that mixes reads and writes gets less out of memory than either one alone",
        "refs": [
          "board-7"
        ]
      }
    ],
    "pcie": [
      {
        "at": "A serial link clocks data out at one end and recovers the timing at the other, so it does not need every wire to agree",
        "refs": [
          "board-8"
        ]
      },
      {
        "at": "That recovery is what buys the distance, and it buys something else: in each lane, each direction gets its own pair, so unlike DDR this link runs both ways at once and never has to stop and turn around",
        "refs": [
          "board-8"
        ]
      }
    ],
    "pipe": [
      {
        "at": "At the hot end that fluid boils; at the cold end it condenses and wicks back",
        "refs": [
          "board-14",
          "board-16"
        ]
      },
      {
        "at": "Boiling something absorbs far more energy than merely warming it, which is why a thin tube like this moves heat many times better than solid copper of the same size, and does it with nothing that can wear out",
        "refs": [
          "board-14"
        ]
      }
    ],
    "fan": [
      {
        "at": "A thinner laptop has a thinner fan, which moves less air, which means less heat can leave, which means the processor has to slow down sooner",
        "refs": [
          "board-9"
        ]
      }
    ],
    "budget": [
      {
        "at": "A laptop processor is usually capable of more than its chassis can feed or cool, and the number on the box is a cooling number wearing a performance number's clothes",
        "refs": [
          "board-9"
        ]
      }
    ],
    "whole": [
      {
        "at": "one to one-and-a-half millimetres thick",
        "refs": [
          "board-4"
        ]
      }
    ]
  },
  "io": {
    "polling": [
      {
        "at": "The simplest answer is that it keeps asking — check the port, do some work, check the port again, for as long as the machine is on",
        "refs": [
          "io-1"
        ]
      },
      {
        "at": "Almost every check finds nothing, so nearly all of that effort is spent discovering that there is nothing to do",
        "refs": [
          "io-1"
        ]
      }
    ],
    "interrupt": [
      {
        "at": "When something happens, the port raises it, and the processor drops what it was doing mid-instruction-stream to deal with it",
        "refs": [
          "io-1",
          "io-4"
        ]
      },
      {
        "at": "Then it resumes exactly where it was",
        "refs": [
          "io-4"
        ]
      },
      {
        "at": "The processor saves where it was onto a stack and jumps to a handler, which saves whatever else it is going to touch",
        "refs": [
          "boot-8"
        ]
      }
    ],
    "cost": [
      {
        "at": "Every interrupt is a detour: save the state, jump, handle, restore, resume",
        "refs": [
          "io-1"
        ]
      },
      {
        "at": "Very fast devices are often polled again, deliberately, because at high enough rates asking constantly is cheaper than being told constantly",
        "refs": [
          "io-1",
          "io-2",
          "io-3"
        ]
      }
    ],
    "dma": [
      {
        "at": "It tells a separate engine where to get the data and where to put it, and that engine moves it directly",
        "refs": [
          "io-1"
        ]
      }
    ],
    "together": [
      {
        "at": "The transfer engine moves the data while the processor works on something else, and raises an interrupt when it has finished",
        "refs": [
          "io-1"
        ]
      }
    ],
    "analogue": [
      {
        "at": "They are voltages, continuous and noisy, and something has to sample them and decide what number each sample was",
        "refs": [
          "io-6",
          "io-7"
        ]
      },
      {
        "at": "That converter is a boundary, and it is lossy in both directions",
        "refs": [
          "io-7"
        ]
      }
    ],
    "display": [
      {
        "at": "Some laptop and phone panels now can, and the link goes quiet while the picture is still",
        "refs": [
          "io-8",
          "io-9"
        ]
      },
      {
        "at": "but the instant anything moves, the changed part — often the whole frame — is sent again",
        "refs": [
          "io-8"
        ]
      }
    ],
    "network": [
      {
        "at": "Past it the rules change completely: things arrive out of order, arrive twice, or never arrive, and none of that is true of anything inside the box",
        "refs": [
          "io-10",
          "io-11"
        ]
      }
    ]
  },
  "boot": {
    "cold": [
      {
        "at": "Every flip-flop in the previous lectures forgets the instant the supply goes, and almost every one of them is in a random state the instant it returns",
        "refs": [
          "boot-3"
        ]
      }
    ],
    "rail": [
      {
        "at": "A supply does not snap to its value; it ramps, and a processor fed a rising voltage does not run slowly — it runs wrongly, because its logic thresholds are not where they should be",
        "refs": [
          "boot-2"
        ]
      },
      {
        "at": "So the whole machine is held in reset until a circuit whose only job is watching the voltage decides it is stable",
        "refs": [
          "boot-1",
          "boot-2"
        ]
      }
    ],
    "post": [
      {
        "at": "So it asks, and configures the memory controller before memory can be used at all",
        "refs": [
          "boot-4",
          "boot-5"
        ]
      }
    ],
    "loader": [
      {
        "at": "It reads the kernel off the disk into memory, sets up just enough for it to start, and then jumps into it",
        "refs": [
          "boot-7"
        ]
      }
    ],
    "done": [
      {
        "at": "A voltage watcher releases reset",
        "refs": [
          "boot-1"
        ]
      },
      {
        "at": "Reset lets the processor fetch a wired-in address",
        "refs": [
          "io-4"
        ]
      },
      {
        "at": "The loader holds a kernel",
        "refs": [
          "boot-7",
          "boot-6"
        ]
      },
      {
        "at": "The kernel raises a wall",
        "refs": [
          "boot-8"
        ]
      }
    ],
    "firmware": [
      {
        "at": "An AMD processor has a small security core that starts from its own boot ROM, sets up the memory, and only then lets the main cores out of reset",
        "refs": [
          "boot-5"
        ]
      }
    ],
    "kernel": [
      {
        "at": "take charge of address translation with its own page tables",
        "refs": [
          "boot-7"
        ]
      }
    ]
  },
  "kernel": {
    "user": [
      {
        "at": "None of them can read the disk, none can talk to the network, and none can see each other's memory",
        "refs": [
          "boot-8",
          "kernel-10",
          "kernel-13"
        ]
      }
    ],
    "wall": [
      {
        "at": "In one mode an instruction that touches a device or another program's memory simply executes; in the other, the same instruction traps and the program is stopped",
        "refs": [
          "boot-8",
          "io-4"
        ]
      },
      {
        "at": "Everything an operating system does about safety rests on the fact that a program cannot flip it — because flipping it is itself a privileged instruction",
        "refs": [
          "boot-8",
          "io-4",
          "kernel-2"
        ]
      }
    ],
    "syscall": [
      {
        "at": "It puts a request in a known place and executes an instruction whose entire purpose is to trap — deliberately triggering the thing that would otherwise be a crash",
        "refs": [
          "boot-8"
        ]
      },
      {
        "at": "The crossing takes time, and it disturbs the caches on both sides",
        "refs": [
          "kernel-4"
        ]
      }
    ],
    "refuse": [
      {
        "at": "The request is inspected on arrival: is this program allowed to open that file, at all, in that way",
        "refs": [
          "kernel-1"
        ]
      }
    ],
    "schedule": [
      {
        "at": "Only the one holding it is lit; the other five are not running slowly, they are not running at all",
        "refs": [
          "boot-8"
        ]
      }
    ],
    "preempt": [
      {
        "at": "Once a program is running, the kernel is not — so what stops a program that never gives the core up",
        "refs": [
          "boot-8"
        ]
      },
      {
        "at": "It fires, the running program is stopped mid-instruction-stream whether it likes it or not, and the kernel is back",
        "refs": [
          "boot-8",
          "kernel-5"
        ]
      },
      {
        "at": "Early personal computers relied on programs voluntarily yielding",
        "refs": [
          "boot-8"
        ]
      }
    ],
    "fair": [
      {
        "at": "There is no correct choice, only trade-offs — which is why a server and a phone, running the same kernel, are usually tuned to schedule quite differently",
        "refs": [
          "kernel-6",
          "kernel-8"
        ]
      }
    ],
    "mmu": [
      {
        "at": "The address is intercepted and rewritten, on the way, by dedicated hardware — and the number that arrives at the memory chip is a different number entirely",
        "refs": [
          "kernel-9",
          "kernel-11",
          "kernel-12"
        ]
      }
    ],
    "isolation": [
      {
        "at": "Because every program's addresses are translated separately, two of them can both use address 4096 and land on completely different memory",
        "refs": [
          "kernel-9",
          "kernel-10",
          "kernel-13"
        ]
      }
    ]
  },
  "os": {
    "monolith": [
      {
        "at": "They all need privilege, so the simplest answer is to run them inside the wall, as part of the kernel itself",
        "refs": [
          "os-1",
          "kernel-13"
        ]
      },
      {
        "at": "A request crosses once, gets everything it needs, and comes back",
        "refs": [
          "os-7"
        ]
      }
    ],
    "micro": [
      {
        "at": "keep the bare minimum privileged, and push filesystem, drivers and network out among the programs, each behind its own boundary",
        "refs": [
          "os-5",
          "os-2",
          "os-4"
        ]
      },
      {
        "at": "much of early microkernels' slowness came from overloading the kernel and from its implementation, not from the idea itself",
        "refs": [
          "os-2"
        ]
      }
    ],
    "trade": [
      {
        "at": "A driver inside the wall that goes wrong takes the machine with it, because it *is* the machine",
        "refs": [
          "kernel-13"
        ]
      },
      {
        "at": "The same driver outside can crash and be restarted while everything else keeps running",
        "refs": [
          "os-4",
          "os-9"
        ]
      },
      {
        "at": "That safety is bought with crossings, and crossings are the expensive thing",
        "refs": [
          "os-7"
        ]
      },
      {
        "at": "Linux is monolithic but loads drivers as modules and has pushed some of them into user space",
        "refs": [
          "os-9"
        ]
      },
      {
        "at": "Windows and macOS are both organised around a small core, but most of what surrounds it still runs inside the wall",
        "refs": [
          "os-7"
        ]
      }
    ],
    "families": [
      {
        "at": "Linux is monolithic with loadable modules",
        "refs": [
          "os-1"
        ]
      },
      {
        "at": "most of them inside the wall from the start, then moved graphics inside too, for speed",
        "refs": [
          "os-7"
        ]
      },
      {
        "at": "macOS puts a BSD layer on top of a Mach-derived core",
        "refs": [
          "os-6",
          "os-8"
        ]
      }
    ],
    "posix": [
      {
        "at": "It depends on the set of calls it can make — open, read, write, and a few hundred more — and those have been broadly stable for decades",
        "refs": [
          "os-10",
          "os-11",
          "os-12"
        ]
      }
    ],
    "rtos": [
      {
        "at": "A real-time system is judged differently: there is a line, and the work must be finished before it, every time",
        "refs": [
          "os-13"
        ]
      }
    ],
    "hard": [
      {
        "at": "The work does not finish before the line, and in a hard real-time system that is not a slow frame — it is a failure, indistinguishable from producing the wrong answer",
        "refs": [
          "os-13"
        ]
      },
      {
        "at": "Guaranteeing a worst case means giving up most of what makes an average fast: caches that sometimes miss, branch prediction that sometimes flushes, schedulers that sometimes pick badly",
        "refs": [
          "os-14"
        ]
      }
    ]
  },
  "compile": {
    "source": [
      {
        "at": "It says what should happen, not how, and nothing in the machine understands a word of it",
        "refs": [
          "compile-1"
        ]
      }
    ],
    "compile": [
      {
        "at": "It works out what the line requires — fetch these values, do this arithmetic, put the answer there — and emits a sequence of much simpler operations that add up to it",
        "refs": [
          "compile-1",
          "compile-3"
        ]
      }
    ],
    "expand": [
      {
        "at": "Each instruction is written down as a number, and each number as bits",
        "refs": [
          "compile-8",
          "compile-9",
          "compile-10"
        ]
      },
      {
        "at": "A line has many correct instruction sequences of hugely different speed",
        "refs": [
          "compile-4",
          "compile-5",
          "compile-6",
          "compile-1"
        ]
      }
    ],
    "machine": [
      {
        "at": "An instruction is a pattern of bits, part of which says what to do and part of which says what to do it to, and the processor is built so that those bits fall on the right wires",
        "refs": [
          "compile-8",
          "compile-9"
        ]
      }
    ],
    "isa": [
      {
        "at": "That is why Lecture 3's pipelines, caches and speculation could be invented without breaking anything",
        "refs": [
          "compile-11",
          "compile-13",
          "compile-14",
          "compile-12"
        ]
      }
    ],
    "speculation": [
      {
        "at": "It guessed, ran ahead, and was ready to throw the work away — which it sometimes did",
        "refs": [
          "compile-18",
          "compile-19",
          "compile-12"
        ]
      }
    ],
    "whole": [
      {
        "at": "Statement, instructions, bits, a pipeline, gates, a channel of electrons a few dozen atoms across",
        "refs": [
          "compile-23",
          "compile-24"
        ]
      }
    ]
  },
  "phone": {
    "die": [
      {
        "at": "What changed is that there was no room for anything else, and every connector deleted is power not spent driving a signal off-chip",
        "refs": [
          "phone-1"
        ]
      }
    ],
    "little": [
      {
        "at": "So there are small, slow, cheap cores that handle it, and they are the ones that are almost always on",
        "refs": [
          "kernel-8"
        ]
      }
    ],
    "prime": [
      {
        "at": "When you touch the screen, a large fast core wakes, does the work in a burst, and goes away again",
        "refs": [
          "kernel-8"
        ]
      },
      {
        "at": "A small core does light work for far less energy",
        "refs": [
          "kernel-8"
        ]
      },
      {
        "at": "Apple's A18 Pro has two performance cores and four efficiency cores",
        "refs": [
          "phone-f12"
        ]
      },
      {
        "at": "MediaTek's Dimensity 9300 has four prime cores, four mid cores and no efficiency cores at all",
        "refs": [
          "phone-f13"
        ]
      }
    ],
    "scheduler": [
      {
        "at": "Put it on a large one and the battery pays for a burst nobody needed",
        "refs": [
          "kernel-8"
        ]
      }
    ],
    "dark": [
      {
        "at": "There are more blocks on this die than can ever be powered at once",
        "refs": [
          "phone-5"
        ]
      },
      {
        "at": "transistors kept shrinking, but the power each one needs stopped falling as fast as they shrank",
        "refs": [
          "phone-5"
        ]
      },
      {
        "at": "It is a design assumption, and it is why specialised blocks are worth their area: a unit that is off costs almost nothing but space",
        "refs": [
          "phone-6"
        ]
      }
    ],
    "sealed": [
      {
        "at": "at most a flat heat spreader, which in some flagships is a vapour chamber",
        "refs": [
          "phone-f14"
        ]
      },
      {
        "at": "Heat leaves through the back of the case and your hand, and that is the entire cooling system",
        "refs": [
          "phone-8"
        ]
      }
    ],
    "throttle": [
      {
        "at": "So heat accumulates, the bar climbs past what the case can lose, and the only control left is the clock — so the clock comes down",
        "refs": [
          "phone-8"
        ]
      }
    ],
    "budget": [
      {
        "at": "so the box's number holds for a few seconds; a quick benchmark measures what you rarely see",
        "refs": [
          "phone-8"
        ]
      }
    ]
  },
  "edge": {
    "asleep": [
      {
        "at": "Not idling, not waiting on a scheduler: disconnected, drawing a few millionths of an amp",
        "refs": [
          "edge-1"
        ]
      }
    ],
    "timer": [
      {
        "at": "So a small counter runs continuously on a trickle of current — the only part of the chip that never stops",
        "refs": [
          "edge-1"
        ]
      }
    ],
    "wake": [
      {
        "at": "The counter reaches its number, or a sensor line changes, and an interrupt brings the processor back — the same mechanism from Lecture 6, doing the only job it does here",
        "refs": [
          "edge-1"
        ]
      }
    ],
    "work": [
      {
        "at": "Sensor, then memory, then radio — and the radio is usually the most expensive part by a wide margin, which is why so much edge design is about *not transmitting*: summarise on the device, send a number rather than a stream",
        "refs": [
          "edge-1",
          "edge-2"
        ]
      },
      {
        "at": "It is that moving the data costs more than doing the work",
        "refs": [
          "edge-2"
        ]
      }
    ],
    "sleep": [
      {
        "at": "Awake it might draw fifteen milliamps; asleep, one microamp",
        "refs": [
          "edge-1"
        ]
      }
    ],
    "unreachable": [
      {
        "at": "So it has to recover from everything by itself, forever, which is a completely different engineering problem from the one a laptop has — and the reason a watchdog timer that reboots the machine when the software stops answering is standard rather than defensive",
        "refs": [
          "boot-1",
          "edge-3"
        ]
      }
    ],
    "determinism": [
      {
        "at": "very nearly the same number of microseconds",
        "refs": [
          "edge-1"
        ]
      },
      {
        "at": "Everything Lectures 2, 3 and 8 added to make an average fast was also a source of variance",
        "refs": [
          "os-14"
        ]
      }
    ],
    "noos": [
      {
        "at": "and often no wall at all — at most a thin one",
        "refs": [
          "edge-f1"
        ]
      }
    ]
  },
  "car": {
    "units": [
      {
        "at": "Not one processor running everything, but many separate units — one for the engine, one for the brakes, one per door, one for the mirrors — each a small machine of exactly the kind Lecture 12 described",
        "refs": [
          "os-15",
          "car-1"
        ]
      }
    ],
    "bus": [
      {
        "at": "It is slow by any standard in this course and completely unbothered by that",
        "refs": [
          "car-2",
          "car-1"
        ]
      }
    ],
    "arbitrate": [
      {
        "at": "Every message starts with an identifier, and the identifier *is* the priority",
        "refs": [
          "car-2",
          "car-1"
        ]
      },
      {
        "at": "As units transmit, the one sending the lower number overrides the others bit by bit, and the losers detect it and stop",
        "refs": [
          "car-2"
        ]
      }
    ],
    "nondestructive": [
      {
        "at": "The contention did not damage the winning message and did not delay it",
        "refs": [
          "car-2"
        ]
      },
      {
        "at": "A network that only detected collisions would make everyone back off and retry, slowing down exactly when it was busiest",
        "refs": [
          "car-5"
        ]
      },
      {
        "at": "so on a busy bus a low-priority unit can wait a long time",
        "refs": [
          "car-2",
          "car-1",
          "car-4"
        ]
      }
    ],
    "zonal": [
      {
        "at": "Put a controller in each corner, wire everything nearby to it, and run one trunk from each corner to a central computer",
        "refs": [
          "car-7",
          "car-9"
        ]
      },
      {
        "at": "Rivian's second-generation R1 is built this way, and lost more than 2.6 km of wire, about 20 kg, doing it",
        "refs": [
          "car-9"
        ]
      },
      {
        "at": "Most cars are still wired the old way, but the industry is moving",
        "refs": [
          "car-7"
        ]
      }
    ],
    "software": [
      {
        "at": "Functions that used to be a box from one supplier are now software sharing a computer with other suppliers' software",
        "refs": [
          "car-8",
          "car-7"
        ]
      },
      {
        "at": "That inversion is the real story of the change: fewer parts, far more integration, and a safety argument that now has to be made about software rather than about wiring",
        "refs": [
          "car-8"
        ]
      }
    ],
    "lockstep": [
      {
        "at": "It runs the identical instructions on the identical data, often a clock cycle or two behind so that one disturbance cannot strike both at the same moment, and a comparator checks the two results continuously",
        "refs": [
          "car-10",
          "car-11",
          "car-12"
        ]
      }
    ],
    "asil": [
      {
        "at": "with lockstep, error-correcting memory and self-tests as the evidence",
        "refs": [
          "car-10",
          "car-11",
          "car-12"
        ]
      }
    ],
    "harness": [
      {
        "at": "about a fifth of the cost of a car's electrical system",
        "refs": [
          "car-7"
        ]
      }
    ]
  },
  "robot": {
    "slow": [
      {
        "at": "That is heavy work — a neural network over an image — and it arrives at video rates, tens of times a second at best",
        "refs": [
          "robot-5"
        ]
      }
    ],
    "contrast": [
      {
        "at": "The inner ring laps the outer one over and over, and that ratio is the whole architecture — a fast, dumb, utterly reliable loop wrapped inside a slow, clever, occasionally unpredictable one",
        "refs": [
          "robot-7",
          "robot-5"
        ]
      },
      {
        "at": "In a real machine it is nearer thirty to one, and often more",
        "refs": [
          "robot-5"
        ]
      }
    ],
    "split": [
      {
        "at": "a microcontroller with a small real-time operating system or none at all",
        "refs": [
          "robot-8"
        ]
      },
      {
        "at": "Those requirements are not merely different, they are contradictory — everything that makes the outer machine fast on average is a source of the variance the inner one cannot tolerate",
        "refs": [
          "robot-10"
        ]
      },
      {
        "at": "So most robots simply have both",
        "refs": [
          "robot-6",
          "robot-8"
        ]
      }
    ],
    "unified": [
      {
        "at": "The obvious next move is a single processor with hardware-enforced separation: real-time cores and application cores on one die, isolated firmly enough that the clever half can never make the reliable half late",
        "refs": [
          "robot-9",
          "robot-11"
        ]
      },
      {
        "at": "Parts like that exist and are being adopted, and the argument about whether they are trustworthy enough for the loops that move heavy things is still running",
        "refs": [
          "robot-12"
        ]
      }
    ],
    "deadline": [
      {
        "at": "On a normal pass it finishes early and the processor waits — deliberately idle, because idle is proof there was margin",
        "refs": [
          "robot-15",
          "robot-4"
        ]
      }
    ],
    "predictable": [
      {
        "at": "So the inner loop gives up everything that produces variance — the caches that sometimes miss, the prediction that sometimes flushes, the scheduler that sometimes chooses badly",
        "refs": [
          "robot-10"
        ]
      },
      {
        "at": "This is the first lecture where average performance is not merely secondary but actively suspect, because an average says nothing about the worst case, and the worst case is the only one that can hurt anybody",
        "refs": [
          "robot-10",
          "robot-15"
        ]
      }
    ],
    "fast": [
      {
        "at": "the loop that sets the current runs faster still, often thousands of times a second",
        "refs": [
          "robot-f15"
        ]
      }
    ],
    "miss": [
      {
        "at": "A real controller watches for exactly this, and when passes keep arriving late it stops the arm",
        "refs": [
          "robot-4"
        ]
      }
    ]
  },
  "datacenter": {
    "node": [
      {
        "at": "at most a battery to ride out a power cut",
        "refs": [
          "datacenter-1"
        ]
      },
      {
        "at": "Nothing in this building is a new kind of machine",
        "refs": [
          "datacenter-1"
        ]
      }
    ],
    "ecc": [
      {
        "at": "in Google's fleet about a third of machines see at least one a year",
        "refs": [
          "datacenter-2"
        ]
      },
      {
        "at": "So server memory carries extra bits that let it detect and correct a flip on the fly",
        "refs": [
          "datacenter-3",
          "datacenter-1"
        ]
      },
      {
        "at": "The rarer errors it cannot correct still stop the machine",
        "refs": [
          "datacenter-2"
        ]
      },
      {
        "at": "Disks, fans, power supplies and network links are all treated the same way: not as things that might fail but as things that are failing, continuously, at a known rate",
        "refs": [
          "datacenter-1",
          "datacenter-4",
          "datacenter-5"
        ]
      }
    ],
    "rack": [
      {
        "at": "It is how much electricity can be delivered to that square metre and how much heat can be taken away from it",
        "refs": [
          "datacenter-8",
          "datacenter-1"
        ]
      },
      {
        "at": "about eight kilowatts in 2026 across ordinary facilities, or just over eleven counting the few new sites built for dense machines",
        "refs": [
          "datacenter-7"
        ]
      },
      {
        "at": "tens of kilowatts each is normal for them",
        "refs": [
          "datacenter-8"
        ]
      },
      {
        "at": "the densest now pass a hundred",
        "refs": [
          "datacenter-7"
        ]
      }
    ],
    "hall": [
      {
        "at": "There is no new idea in the room — the ninth rack is identical to the first, and that sameness is deliberate, because anything that has to be reasoned about individually does not scale",
        "refs": [
          "datacenter-1"
        ]
      }
    ],
    "shard": [
      {
        "at": "A job too large for one machine is divided and sent out, a piece to each node",
        "refs": [
          "datacenter-11",
          "datacenter-1"
        ]
      },
      {
        "at": "If work could always be divided like this, a hundred thousand machines really would be a hundred thousand times faster",
        "refs": [
          "datacenter-12",
          "datacenter-13"
        ]
      }
    ],
    "compute": [
      {
        "at": "Every node runs the same code on its own slice, and none of them needs to know the others exist",
        "refs": [
          "datacenter-11",
          "datacenter-1"
        ]
      }
    ],
    "gather": [
      {
        "at": "Almost every node has finished and is now idle, waiting, because the result is not the pieces — it is the combination, and the combination happens somewhere specific",
        "refs": [
          "datacenter-14",
          "datacenter-1"
        ]
      },
      {
        "at": "one more chance that the slowest is very slow",
        "refs": [
          "datacenter-1"
        ]
      },
      {
        "at": "Whatever fraction of a job cannot be divided sets a floor on how fast it can ever go, no matter how many machines you add",
        "refs": [
          "datacenter-12",
          "datacenter-1"
        ]
      }
    ],
    "pue": [
      {
        "at": "A typical enterprise room spends around a third of its electricity on everything that is not computing — cooling, conversion losses, distribution",
        "refs": [
          "datacenter-7",
          "datacenter-6",
          "datacenter-16"
        ]
      },
      {
        "at": "The best hyperscale sites get that down to roughly a tenth",
        "refs": [
          "datacenter-15",
          "datacenter-17"
        ]
      },
      {
        "at": "At this scale, the building is part of the computer",
        "refs": [
          "datacenter-1"
        ]
      }
    ],
    "power": [
      {
        "at": "building that capacity costs more than the electricity it carries",
        "refs": [
          "datacenter-1"
        ]
      }
    ],
    "cooling": [
      {
        "at": "air runs out at around twenty kilowatts a rack",
        "refs": [
          "datacenter-8"
        ]
      }
    ]
  },
  "extremes": {
    "strike": [
      {
        "at": "If it deposits more charge than a memory cell uses to hold its value, the cell changes state",
        "refs": [
          "extremes-3",
          "extremes-4",
          "extremes-5"
        ]
      },
      {
        "at": "the RAD750 is specified at under 1.6 errors per ten billion bits a day",
        "refs": [
          "extremes-f3"
        ]
      }
    ],
    "seu": [
      {
        "at": "This is called a single event upset, and the important word is *upset*",
        "refs": [
          "extremes-3"
        ]
      },
      {
        "at": "Watch the same strikes now, with something rewriting memory continuously in the background",
        "refs": [
          "extremes-4"
        ]
      }
    ],
    "smaller": [
      {
        "at": "Per bit, an advanced node can actually be struck *less* often",
        "refs": [
          "extremes-5",
          "extremes-6"
        ]
      }
    ],
    "tmr": [
      {
        "at": "So stop caring about it: run the same computation on three identical units and compare the answers",
        "refs": [
          "extremes-7",
          "extremes-8",
          "extremes-5"
        ]
      },
      {
        "at": "Two units detect a disagreement but cannot tell you which one is wrong",
        "refs": [
          "extremes-5",
          "extremes-4"
        ]
      }
    ],
    "voter": [
      {
        "at": "Three units, three times the area, three times the power, and the throughput of one",
        "refs": [
          "extremes-5",
          "extremes-4"
        ]
      }
    ],
    "slow": [
      {
        "at": "the hardening needs a special process that trails commercial chips by generations",
        "refs": [
          "extremes-f3"
        ]
      },
      {
        "at": "Two hundred thousand to a million rads of total dose, depending on the version",
        "refs": [
          "extremes-f3"
        ]
      },
      {
        "at": "It flies on Curiosity and Perseverance and on the order of a hundred satellites",
        "refs": [
          "extremes-12",
          "extremes-11",
          "extremes-10"
        ]
      }
    ],
    "notvon": [
      {
        "at": "Wildly different budgets, and underneath, the identical arrangement: memory over here, a processor over there, instructions fetched across the gap, one step per tick",
        "refs": [
          "extremes-14"
        ]
      },
      {
        "at": "Lecture 2 measured it: the walk between memory and processor dominates both time and energy",
        "refs": [
          "chip-17",
          "extremes-14"
        ]
      }
    ],
    "neuro": [
      {
        "at": "IBM's NorthPole keeps a clock but puts all its memory on the chip beside the arithmetic, and reports about twenty-five times the energy efficiency of a GPU on a comparable process, on image-recognition inference",
        "refs": [
          "extremes-17"
        ]
      },
      {
        "at": "Neither has shipped as a commercial product",
        "refs": [
          "extremes-16",
          "extremes-18"
        ]
      }
    ],
    "quantum": [
      {
        "at": "It is a machine on which a small number of specific problems have a fundamentally cheaper method",
        "refs": [
          "extremes-19",
          "extremes-20"
        ]
      },
      {
        "at": "Superconducting qubits work at ten to twenty millikelvin — colder than deep space",
        "refs": [
          "extremes-21",
          "extremes-23"
        ]
      },
      {
        "at": "whose cold space alone is about the size of a kitchen fridge",
        "refs": [
          "extremes-f4"
        ]
      }
    ],
    "nofix": [
      {
        "at": "about every twenty-six months the Sun passes between them and cuts the link altogether",
        "refs": [
          "extremes-f2"
        ]
      }
    ],
    "hard": [
      {
        "at": "which is why hardened parts are built to be immune to it",
        "refs": [
          "extremes-f3"
        ]
      }
    ]
  },
  "implant": {
    "sealed": [
      {
        "at": "It cannot be plugged in, opened, cooled by a fan, rebooted by a person who is annoyed with it, or replaced without surgery",
        "refs": [
          "implant-2"
        ]
      }
    ],
    "array": [
      {
        "at": "The threads are finer than a human hair and are placed by a robot, because a hand is not steady enough and the thing being avoided is a blood vessel",
        "refs": [
          "implant-2",
          "implant-1",
          "implant-3"
        ]
      },
      {
        "at": "Between them they carry 1,024 recording sites",
        "refs": [
          "implant-2"
        ]
      },
      {
        "at": "in the first person to receive one, a number of threads pulled back out of the brain within weeks",
        "refs": [
          "implant-f9"
        ]
      }
    ],
    "warm": [
      {
        "at": "the standard for active implants lets no outer surface run more than 2 °C above body temperature",
        "refs": [
          "implant-f7"
        ]
      },
      {
        "at": "designers working on the brain aim for no more than about one degree",
        "refs": [
          "implant-6"
        ]
      },
      {
        "at": "published estimates run from about fifteen milliwatts for a small implant in the cortex",
        "refs": [
          "implant-6"
        ]
      },
      {
        "at": "to around seventy for a larger unit set into the skull",
        "refs": [
          "implant-f8"
        ]
      },
      {
        "at": "The recording chip in a device like this draws about twenty-five milliwatts",
        "refs": [
          "implant-5"
        ]
      }
    ],
    "nofan": [
      {
        "at": "Here the case is a person and the air is blood",
        "refs": [
          "implant-10",
          "implant-9"
        ]
      }
    ],
    "raw": [
      {
        "at": "To see a spike you have to sample fast and finely — roughly two hundred kilobits per second per channel",
        "refs": [
          "implant-4",
          "implant-1"
        ]
      },
      {
        "at": "A thousand channels of that is about two hundred megabits per second arriving at the processor, continuously, forever",
        "refs": [
          "implant-4"
        ]
      }
    ],
    "pipe": [
      {
        "at": "Neuralink's own brief allows the compression and the radio together less than ten milliwatts",
        "refs": [
          "implant-4"
        ]
      },
      {
        "at": "This is not a queue that will drain; it is two hundred times more signal than the pipe can ever carry",
        "refs": [
          "implant-4"
        ]
      }
    ],
    "inside": [
      {
        "at": "It is inside because the reduction has to happen on the expensive side of the bottleneck — once the data has failed to get out, no amount of computing elsewhere can recover it",
        "refs": [
          "implant-4",
          "implant-6"
        ]
      }
    ],
    "spikes": [
      {
        "at": "The gap was about two hundred to one",
        "refs": [
          "implant-4"
        ]
      },
      {
        "at": "the chip's own spike detector can cut what it sends by up to 1,250 times",
        "refs": [
          "implant-5"
        ]
      }
    ]
  }
}

export const credits: Record<string, Credit[]> = {
  "chip": [
    {
      "name": "Julius E. Lilienfeld",
      "for": "Filed the first field-effect transistor patent (1926), decades before one could be built.",
      "source": "chip-11"
    },
    {
      "name": "John Bardeen and Walter Brattain",
      "for": "Built the first working transistor, a point-contact device, at Bell Labs in December 1947.",
      "source": "chip-10"
    },
    {
      "name": "Mohamed M. (John) Atalla and Dawon Kahng",
      "for": "Made the first successful insulated-gate field-effect transistor (MOSFET) at Bell Labs, 1959: the switch this lecture zooms into.",
      "source": "chip-9"
    },
    {
      "name": "Jack Kilby",
      "for": "Built the first integrated circuit at Texas Instruments, 12 September 1958 (Nobel Prize in Physics 2000).",
      "source": "chip-22"
    },
    {
      "name": "Robert Noyce",
      "for": "Patented the monolithic silicon IC (1959), with components wired by metal lines on the oxide: the basis of the layered die.",
      "source": "chip-23"
    },
    {
      "name": "Frank Wanlass and Chih-Tang Sah",
      "for": "Invented complementary MOS (CMOS) logic, 1963; Wanlass's patent is the two-transistor inverter.",
      "source": "chip-14"
    },
    {
      "name": "Claude Shannon",
      "for": "Showed in 1938 that Boolean algebra describes switching circuits, so logic and arithmetic can be built from switches."
    },
    {
      "name": "Gene Amdahl",
      "for": "Amdahl's law (1967): the serial part of a job caps what more processors can gain."
    },
    {
      "name": "Mark Bohr, Robert Chau, Tahir Ghani, Kaizad Mistry (Intel)",
      "for": "Intel's hafnium high-k metal-gate transistors (45 nm, 2007), replacing the ~1.2 nm silicon-dioxide gate insulator that leaked by tunnelling.",
      "source": "chip-12"
    },
    {
      "name": "Ross Freeman",
      "for": "Invented the FPGA (1984) and co-founded Xilinx; the XC2064 (1985) was the first commercial FPGA.",
      "source": "chip-15"
    },
    {
      "name": "H. T. Kung (with Charles Leiserson)",
      "for": "Systolic arrays (late 1970s), the architecture of the TPU's matrix unit."
    },
    {
      "name": "Norman Jouppi, David Patterson et al. (Google)",
      "for": "Designed and characterised the first TPU, built around a 256x256 systolic matrix unit (ISCA 2017).",
      "source": "chip-21"
    },
    {
      "name": "Ian Kuon and Jonathan Rose",
      "for": "Measured the FPGA-vs-ASIC gap: about 40x area (21x with hard blocks), 3-4x delay, ~12x dynamic power.",
      "source": "chip-16"
    },
    {
      "name": "Mark Horowitz",
      "for": "Quantified the energy overhead of programmability: ~70 pJ per instruction versus a few pJ per operation.",
      "source": "chip-17"
    }
  ],
  "memory": [
    {
      "name": "William Henry Eccles and Frank Wilfred Jordan",
      "for": "Invented the flip-flop, a cross-coupled vacuum-tube trigger circuit; patent filed June 1918.",
      "source": "memory-2"
    },
    {
      "name": "Robert H. Dennard",
      "for": "Invented the one-transistor, one-capacitor DRAM cell at IBM (US 3,387,286, granted 1968).",
      "source": "memory-4"
    },
    {
      "name": "Robert Norman",
      "for": "Patented an early semiconductor static RAM design at Fairchild (1963).",
      "source": "memory-25"
    },
    {
      "name": "Ted Hoff, Bob Abbott, Bob Reed (Intel) and Bill Regitz (Honeywell)",
      "for": "Intel 1103 (1970), the first DRAM to compete with magnetic core on price, built on Regitz's three-transistor cell.",
      "source": "memory-5"
    },
    {
      "name": "Maurice V. Wilkes",
      "for": "Proposed the 'slave memory' (1965), the first description of a CPU cache.",
      "source": "memory-9"
    },
    {
      "name": "Tom Kilburn and the Manchester Atlas team",
      "for": "Atlas one-level store (1959-62), the first virtual memory, from which the locality principle grew.",
      "source": "memory-10"
    },
    {
      "name": "Peter J. Denning",
      "for": "Formalised the locality principle and working-set model that justify caches.",
      "source": "memory-10"
    },
    {
      "name": "Wm. A. Wulf and Sally A. McKee",
      "for": "Named the 'memory wall', the growing processor-DRAM speed gap (1995)."
    },
    {
      "name": "Dawon Kahng and Simon M. Sze",
      "for": "Invented the floating-gate memory transistor at Bell Labs (1967), the basis of EPROM and flash.",
      "source": "memory-16"
    },
    {
      "name": "Fujio Masuoka",
      "for": "Invented flash memory at Toshiba (IEDM 1984), and later NAND flash.",
      "source": "memory-17"
    }
  ],
  "time": [
    {
      "name": "Robert H. Dennard (with Gaensslen, Yu, Rideout, Bassous, LeBlanc, IBM)",
      "for": "Set out the MOSFET scaling rules (1974) now called Dennard scaling: shrink dimensions and voltage together, keeping power density constant.",
      "source": "time-1"
    },
    {
      "name": "William Eccles and Frank Jordan",
      "for": "Invented the bistable trigger circuit (1918), the first flip-flop and ancestor of every clocked register.",
      "source": "time-6"
    },
    {
      "name": "Ivan Sutherland",
      "for": "Micropipelines, his 1988 Turing lecture: explained why clocked design dominates and showed that clockless, event-driven pipelines are practical.",
      "source": "time-5"
    },
    {
      "name": "IBM Stretch team (project led by Stephen Dunwell)",
      "for": "The IBM 7030 Stretch (1961) introduced instruction pipelining and lookahead.",
      "source": "time-7"
    },
    {
      "name": "James E. Smith",
      "for": "Studied branch prediction strategies (1981) and showed 2-bit saturating counters work well: the basis of dynamic prediction.",
      "source": "time-8"
    },
    {
      "name": "Gene Amdahl",
      "for": "Amdahl's law (1967): parallel speedup is limited by the part of the work that must run serially."
    },
    {
      "name": "John Hennessy and David Patterson",
      "for": "RISC pioneers whose five-stage pipeline became the textbook model; their Turing lecture traces Dennard scaling's end and the move to multicore.",
      "source": "time-3"
    },
    {
      "name": "Mark Bohr (Intel)",
      "for": "Explained why Dennard's voltage scaling stalled: threshold-voltage limits, subthreshold leakage, and gate-oxide leakage.",
      "source": "time-2"
    },
    {
      "name": "Herb Sutter",
      "for": "'The Free Lunch Is Over' (2005) explained the clock-speed plateau to software developers.",
      "source": "time-12"
    }
  ],
  "fab": [
    {
      "name": "Jan Czochralski",
      "for": "Invented the crystal-pulling method (1916, AEG Berlin) now used to grow single-crystal silicon ingots.",
      "source": "fab-1"
    },
    {
      "name": "Gordon K. Teal",
      "for": "Adapted the Czochralski method at Bell Labs to grow semiconductor (germanium) single crystals, 1948-1950.",
      "source": "fab-1"
    },
    {
      "name": "Jules Andrus and Walter L. Bond",
      "for": "Bell Labs, 1955: adapted photoengraving to pattern oxide masks on silicon.",
      "source": "fab-6"
    },
    {
      "name": "Jay Lathrop and James Nall",
      "for": "U.S. Army Diamond Ordnance Fuze Labs, 1957: patented photolithography for semiconductor devices.",
      "source": "fab-6"
    },
    {
      "name": "Jay Last and Robert Noyce",
      "for": "Built one of the first step-and-repeat cameras at Fairchild (1958) to print many identical devices per wafer.",
      "source": "fab-6"
    },
    {
      "name": "Jean Hoerni",
      "for": "Invented the planar process (1957-59, Fairchild), the basis for building chips as stacked patterned layers.",
      "source": "fab-7"
    },
    {
      "name": "Lord Rayleigh (John William Strutt)",
      "for": "His optical resolution criterion underlies lithography's scaling rule, CD = k1·λ/NA.",
      "source": "fab-10"
    },
    {
      "name": "Burn J. Lin",
      "for": "Proposed 193 nm water-immersion lithography (2002, TSMC), which carried DUV to the 7 nm generation.",
      "source": "fab-14"
    },
    {
      "name": "Hiroo Kinoshita",
      "for": "At NTT, projected the first EUV (soft X-ray) images in the mid-1980s: the origin of EUV lithography.",
      "source": "fab-25"
    },
    {
      "name": "B. T. Murphy",
      "for": "Bell Labs; 1964 model of yield and cost against die size, behind 'big chips are expensive'."
    },
    {
      "name": "Samuel Naffziger et al.",
      "for": "Led AMD's chiplet architecture for EPYC and Ryzen, a yield-driven move away from monolithic dies."
    }
  ],
  "board": [
    {
      "name": "Paul Eisler",
      "for": "Invented the printed circuit board: experiments from 1936, a working PCB radio in 1942, foil-etch patent filed 1943.",
      "source": "board-1"
    },
    {
      "name": "Harold Vezey Strong",
      "for": "Co-inventor with Eisler on the 1943 printed-circuit foil-etch patent GB639178.",
      "source": "board-2"
    },
    {
      "name": "Richard S. Gaugler",
      "for": "General Motors engineer who patented the first wicked evaporation-condensation heat-transfer device, the heat-pipe concept (filed 1942).",
      "source": "board-16"
    },
    {
      "name": "George M. Grover",
      "for": "Los Alamos physicist who invented and named the heat pipe (1963), publishing it with Cotter and Erickson in 1964.",
      "source": "board-15"
    },
    {
      "name": "Theodore (Ted) Cotter",
      "for": "Los Alamos co-author of the 1964 heat-pipe paper; credited with Grover for bringing heat pipes into mainstream science.",
      "source": "board-17"
    },
    {
      "name": "George F. Erickson",
      "for": "Los Alamos engineer who built the first working heat-pipe prototypes.",
      "source": "board-17"
    },
    {
      "name": "Ajay V. Bhatt",
      "for": "Led the Intel team that developed USB; European Inventor Award 2013.",
      "source": "board-18"
    },
    {
      "name": "Lloyd H. Dixon Jr.",
      "for": "Unitrode engineer whose widely used magnetics design notes show how to size switching-converter inductors.",
      "source": "board-11"
    }
  ],
  "io": [
    {
      "name": "Dick Turner and Joe Rawlings (NACA)",
      "for": "Designed the UNIVAC 1103A interrupt (1955–56), generally cited as the first true interrupt system.",
      "source": "io-5"
    },
    {
      "name": "National Bureau of Standards DYSEAC team",
      "for": "DYSEAC (1954): first I/O interrupts and apparently the first DMA.",
      "source": "io-5"
    },
    {
      "name": "J. W. Forgie",
      "for": "Lincoln Lab TX-2 multiple-sequence (priority interrupt) system, 1957.",
      "source": "io-5"
    },
    {
      "name": "Edsger W. Dijkstra",
      "for": "Independently designed the interrupt system of the Electrologica X-1 (1957–58).",
      "source": "io-5"
    },
    {
      "name": "Claude E. Shannon",
      "for": "Sampling theorem (1949): the basis of analogue-to-digital conversion.",
      "source": "io-6"
    },
    {
      "name": "Jeffrey Mogul and K. K. Ramakrishnan",
      "for": "Identified receive livelock and the switch to polling under load.",
      "source": "io-2"
    },
    {
      "name": "Jerome Saltzer, David Reed, David Clark",
      "for": "End-to-end argument: reliability over an unreliable network belongs at the endpoints.",
      "source": "io-11"
    }
  ],
  "boot": [],
  "kernel": [
    {
      "name": "Tom Kilburn and the Manchester Atlas team",
      "for": "Paged virtual memory with hardware address translation (Atlas, 1962).",
      "source": "kernel-11"
    },
    {
      "name": "Peter J. Denning",
      "for": "Systematised virtual memory (1970 survey; working-set model).",
      "source": "kernel-12"
    },
    {
      "name": "Fernando J. Corbató",
      "for": "CTSS (1961–62): early time-sharing that preempted users with a clock interrupt.",
      "source": "kernel-5"
    },
    {
      "name": "Jerome H. Saltzer and Michael D. Schroeder",
      "for": "Protection principles, including complete mediation (1975), and Multics hardware protection rings (1972).",
      "source": "kernel-1"
    },
    {
      "name": "Robert Wahbe, Steven Lucco, Thomas Anderson, Susan Graham",
      "for": "Software-based fault isolation (1993).",
      "source": "kernel-3"
    },
    {
      "name": "Livio Soares and Michael Stumm",
      "for": "Measured the direct and indirect cost of system calls (FlexSC, 2010).",
      "source": "kernel-4"
    },
    {
      "name": "Peter Zijlstra",
      "for": "Proposed the EEVDF scheduler version Linux adopted from 6.6 (2023).",
      "source": "kernel-7"
    }
  ],
  "os": [
    {
      "name": "Andrew S. Tanenbaum",
      "for": "MINIX; the microkernel side of the 1992 debate; co-author of MINIX 3's self-repairing design.",
      "source": "os-1"
    },
    {
      "name": "Linus Torvalds",
      "for": "Created Linux (1991), the monolithic kernel in the debate.",
      "source": "os-1"
    },
    {
      "name": "Per Brinch Hansen",
      "for": "RC 4000 nucleus (1969–70), the first microkernel-style design.",
      "source": "os-5"
    },
    {
      "name": "Jochen Liedtke",
      "for": "L3/L4 microkernels. Showed that microkernel IPC can be fast.",
      "source": "os-2"
    },
    {
      "name": "Richard Rashid, Avadis Tevanian and the CMU Mach team",
      "for": "Mach (1985–86), the kernel underneath NeXTSTEP and macOS XNU.",
      "source": "os-6"
    },
    {
      "name": "Dennis Ritchie and Ken Thompson",
      "for": "Unix and its system-call interface (1974 paper).",
      "source": "os-10"
    },
    {
      "name": "C. L. Liu and James W. Layland",
      "for": "Rate-monotonic and deadline scheduling theory for hard real-time systems (1973).",
      "source": "os-13"
    },
    {
      "name": "Dave Cutler",
      "for": "Led the design of Windows NT at Microsoft, after leading VMS at Digital."
    }
  ],
  "compile": [
    {
      "name": "Grace Hopper",
      "for": "A-0 (1952) for the UNIVAC I, often called the first compiler; later FLOW-MATIC, a precursor of COBOL.",
      "source": "compile-2"
    },
    {
      "name": "John Backus (and the IBM FORTRAN team)",
      "for": "FORTRAN (1957): the first widely used high-level language, delivered with an optimising compiler.",
      "source": "compile-3"
    },
    {
      "name": "Frances E. Allen",
      "for": "Founded program optimisation and control-flow analysis; first woman to win the Turing Award (2006).",
      "source": "compile-7"
    },
    {
      "name": "Henry Massalin",
      "for": "Superoptimizer (1987): exhaustive search for the shortest correct instruction sequence.",
      "source": "compile-4"
    },
    {
      "name": "Alfred Aho, Monica Lam, Ravi Sethi, Jeffrey Ullman",
      "for": "Authors of the 'Dragon Book', the standard compiler textbook.",
      "source": "compile-1"
    },
    {
      "name": "John von Neumann",
      "for": "First Draft of a Report on the EDVAC (1945): the first written description of a stored-program computer, instructions held as numbers.",
      "source": "compile-10"
    },
    {
      "name": "Gene Amdahl, Gerrit Blaauw, Fred Brooks",
      "for": "Defined 'architecture' (the ISA) as separate from implementation with IBM System/360 (1964): one ISA across compatible models.",
      "source": "compile-11"
    },
    {
      "name": "Andrew Waterman, Krste Asanovic (RISC-V)",
      "for": "Co-creators of RISC-V at Berkeley and editors of its ISA manual; base instructions are a fixed 32 bits.",
      "source": "compile-8"
    },
    {
      "name": "Robert Tomasulo",
      "for": "Out-of-order dynamic scheduling algorithm (IBM 360/91, 1967).",
      "source": "compile-14"
    },
    {
      "name": "James E. Smith and Andrew Pleszkun",
      "for": "Precise interrupts and the reorder buffer (1988); Smith also wrote the foundational branch-prediction study (1981).",
      "source": "compile-13"
    },
    {
      "name": "John Hennessy and David Patterson",
      "for": "RISC pioneers (Stanford MIPS, Berkeley RISC), authors of the standard architecture textbook; 2017 Turing Award.",
      "source": "compile-12"
    },
    {
      "name": "Paul Kocher, Jann Horn et al.",
      "for": "Disclosed Spectre (2018), showing speculative execution leaves observable traces.",
      "source": "compile-19"
    },
    {
      "name": "Claude Shannon",
      "for": "Showed Boolean algebra describes switching circuits (1938), the basis of building adders from gates.",
      "source": "compile-22"
    },
    {
      "name": "Peter Kogge and Harold Stone",
      "for": "Parallel-prefix recurrence solution (1973) behind the Kogge-Stone fast adder.",
      "source": "compile-21"
    },
    {
      "name": "Mohamed (John) Atalla and Dawon Kahng",
      "for": "Demonstrated the MOSFET at Bell Labs (1959–60).",
      "source": "chip-9"
    },
    {
      "name": "Frank Wanlass and Chih-Tang Sah",
      "for": "Invented CMOS (Fairchild, 1963).",
      "source": "chip-14"
    }
  ],
  "phone": [
    {
      "name": "Robert H. Dennard",
      "for": "MOSFET scaling rules (1974). Their breakdown after about 2005 leads to dark silicon.",
      "source": "phone-7"
    },
    {
      "name": "Hadi Esmaeilzadeh, Doug Burger et al.",
      "for": "Quantified dark silicon (ISCA 2011).",
      "source": "phone-5"
    },
    {
      "name": "Michael B. Taylor",
      "for": "The 'four horsemen' of dark silicon; the case for specialised mostly-off blocks (2012).",
      "source": "phone-6"
    },
    {
      "name": "Mark Horowitz",
      "for": "Framed computing's energy problem: data movement costs far more than arithmetic.",
      "source": "phone-1"
    }
  ],
  "edge": [
    {
      "name": "Gregory J. Pottie and William J. Kaiser",
      "for": "Wireless integrated network sensors (UCLA), and the energy argument that communication costs more than computation.",
      "source": "edge-2"
    },
    {
      "name": "Jack Ganssle",
      "for": "Long-standing embedded-systems practice writing on watchdog design; the Clementine case study.",
      "source": "edge-3"
    }
  ],
  "car": [
    {
      "name": "Uwe Kiencke",
      "for": "Started the Bosch serial-bus project in 1983 that became CAN; co-presented it at the 1986 SAE congress.",
      "source": "car-3"
    },
    {
      "name": "Siegfried Dais",
      "for": "Bosch engineer who co-presented CAN at the 1986 SAE congress.",
      "source": "car-3"
    },
    {
      "name": "Martin Litschel",
      "for": "Bosch engineer who co-presented CAN at the 1986 SAE congress.",
      "source": "car-3"
    },
    {
      "name": "Wolfgang Borst, Wolfgang Botzenhard, Otto Karl, Helmut Schelling, Jan Unruh",
      "for": "Bosch engineers CiA counts among the 'fathers of CAN'; implemented its error-detection mechanisms.",
      "source": "car-3"
    },
    {
      "name": "Ken Tindell, Alan Burns, Andy Wellings",
      "for": "University of York; the original worst-case response-time analysis for CAN messages (1995).",
      "source": "car-4"
    },
    {
      "name": "Robert I. Davis, Alan Burns, Reinder J. Bril, Johan J. Lukkien",
      "for": "Found and corrected a flaw in the original CAN schedulability analysis (2007).",
      "source": "car-1"
    },
    {
      "name": "Robert Metcalfe, David Boggs",
      "for": "Invented Ethernet at Xerox PARC: the collision-detect-and-back-off network CAN is contrasted with.",
      "source": "car-5"
    },
    {
      "name": "Manfred Broy",
      "for": "TU Munich; Charette's source for a premium car's roughly 100 million lines of code on 70-100 ECUs.",
      "source": "os-15"
    },
    {
      "name": "Peter Bannon, Ganesh Venkataramanan, Debjit Das Sarma, Emil Talpes et al.",
      "for": "Tesla team behind the Full Self-Driving computer (2019), an in-house car SoC."
    }
  ],
  "robot": [
    {
      "name": "C. L. Liu and James W. Layland",
      "for": "Founded hard-real-time scheduling theory in 1973: rate-monotonic and deadline-driven scheduling, with their utilization bounds.",
      "source": "robot-15"
    },
    {
      "name": "Reinhard Wilhelm (with Engblom, Ermedahl, Holsti, Ferdinand et al.)",
      "for": "Lead author of the 2008 worst-case execution-time survey explaining why caches and speculation defeat timing guarantees; co-founded AbsInt.",
      "source": "robot-10"
    },
    {
      "name": "Rodney A. Brooks",
      "for": "Subsumption (layered) control architecture, MIT 1986: simple fast reactive layers keep running beneath slower, more capable ones.",
      "source": "robot-7"
    },
    {
      "name": "Thomas Gleixner, Ingo Molnar and the PREEMPT_RT community",
      "for": "Led the roughly twenty-year effort to make mainline Linux fully preemptible (PREEMPT_RT), merged for Linux 6.12 in 2024."
    },
    {
      "name": "Jan Staschulat, Ralph Lange (Bosch) and the micro-ROS project",
      "for": "Bring ROS 2 onto microcontrollers for time-critical robot control; authors of micro-ROS's budget-based real-time executor.",
      "source": "robot-6"
    }
  ],
  "datacenter": [
    {
      "name": "Luiz André Barroso & Urs Hölzle",
      "for": "Framed the 'warehouse-scale computer': the datacenter designed and programmed as one machine; authored the standard text.",
      "source": "datacenter-1"
    },
    {
      "name": "Richard W. Hamming",
      "for": "Invented error-correcting (Hamming) codes at Bell Labs, 1950: the basis of ECC memory.",
      "source": "datacenter-3"
    },
    {
      "name": "Bianca Schroeder, Eduardo Pinheiro, Wolf-Dietrich Weber",
      "for": "Large-scale field study of DRAM errors across Google's fleet (2009), showing errors far more common than previously assumed.",
      "source": "datacenter-2"
    },
    {
      "name": "Gene Amdahl",
      "for": "Stated the limit that the serial fraction of a job places on parallel speedup (1967).",
      "source": "datacenter-12"
    },
    {
      "name": "John Gustafson",
      "for": "Showed that scaling the problem with the machine escapes much of Amdahl's pessimism (1988).",
      "source": "datacenter-13"
    },
    {
      "name": "Jeffrey Dean & Sanjay Ghemawat",
      "for": "MapReduce: the scatter/compute/gather model with automatic partitioning and failure handling.",
      "source": "datacenter-11"
    },
    {
      "name": "Jeffrey Dean & Luiz André Barroso",
      "for": "'The Tail at Scale': why the slowest part of a fan-out and gather dominates at large scale.",
      "source": "datacenter-14"
    },
    {
      "name": "Christian Belady (with Chris Malone)",
      "for": "Credited with originating the PUE metric (HP, 2006), later promoted by The Green Grid and standardised as ISO/IEC 30134-2.",
      "source": "datacenter-18"
    }
  ],
  "extremes": [
    {
      "name": "John von Neumann",
      "for": "Described the stored-program design (EDVAC draft, 1945) and majority voting for reliable computing from unreliable parts (1952 lectures, published 1956).",
      "source": "extremes-8"
    },
    {
      "name": "John Backus",
      "for": "Coined 'von Neumann bottleneck' in his 1977 Turing Award lecture (published 1978).",
      "source": "extremes-14"
    },
    {
      "name": "Robert E. Lyons and Wouter Vanderkulk",
      "for": "IBM engineers whose 1962 paper named and analysed triple-modular redundancy for computers in space.",
      "source": "extremes-7"
    },
    {
      "name": "Kenneth A. LaBel",
      "for": "NASA Goddard radiation-effects engineer; lead author of NASA's single-event-effect specification and SEECA criticality guidance.",
      "source": "extremes-4"
    },
    {
      "name": "Robert Baumann",
      "for": "Texas Instruments reliability researcher who showed per-bit SRAM soft-error rates saturating while system-level rates kept growing.",
      "source": "extremes-5"
    },
    {
      "name": "Eishi Ibe",
      "for": "Hitachi researcher who quantified multi-cell upsets growing as SRAM scaled from 250 nm to 22 nm.",
      "source": "extremes-6"
    },
    {
      "name": "R. W. Berger and colleagues (BAE Systems)",
      "for": "Designed the RAD750, the licensed radiation-hardened PowerPC 750 used on Curiosity and Perseverance."
    },
    {
      "name": "Mark Horowitz",
      "for": "Stanford; quantified that data movement (a DRAM access) costs orders of magnitude more energy than arithmetic.",
      "source": "chip-17"
    },
    {
      "name": "Mike Davies",
      "for": "Directs Intel's Neuromorphic Computing Lab; lead author on Loihi.",
      "source": "extremes-15"
    },
    {
      "name": "Dharmendra S. Modha",
      "for": "IBM Research; led the TrueNorth and NorthPole chips.",
      "source": "extremes-18"
    },
    {
      "name": "Peter Shor",
      "for": "Quantum algorithm for factoring and discrete logarithms (1994).",
      "source": "extremes-19"
    },
    {
      "name": "Lov Grover",
      "for": "Quantum search algorithm with a quadratic speedup (1996).",
      "source": "extremes-20"
    }
  ],
  "implant": [
    {
      "name": "Elon Musk and the Neuralink team",
      "for": "Neuralink's 2019 platform: flexible polymer threads, a robot to insert them and a custom recording chip, which the lecture's device is modelled on.",
      "source": "implant-1"
    },
    {
      "name": "Dongjin Seo, Do-Yeon Yoon, Paul Merolla et al. (Neuralink)",
      "for": "Designed the 1024-channel neural recording chip with on-chip spike detection at 24.7 mW: the lecture's 'twenty-five milliwatt' chip.",
      "source": "implant-5"
    },
    {
      "name": "Patrick D. Wolf",
      "for": "Early systematic analysis (2008) of tissue heating as a design limit for implanted cortical interfaces; the widely cited ~1 °C limit."
    },
    {
      "name": "Abhishek Bhattacharjee, Rajit Manohar, Anurag Khandelwal (Yale)",
      "for": "Architects of SCALO and HALO, implant processors designed around a conservative self-chosen 15 mW power limit, arguing for on-implant processing.",
      "source": "implant-6"
    },
    {
      "name": "Richard A. Normann",
      "for": "Invented the Utah electrode array used in most human intracortical BCIs; co-authored a key heating study of an active implanted array.",
      "source": "implant-10"
    },
    {
      "name": "Leigh R. Hochberg, John P. Donoghue and the BrainGate team",
      "for": "Landmark 2006 study: a person with tetraplegia controlled a cursor and devices through a 96-electrode array in motor cortex.",
      "source": "implant-13"
    },
    {
      "name": "Noland Arbaugh",
      "for": "First participant in Neuralink's PRIME human trial, implanted January 2024.",
      "source": "implant-11"
    }
  ]
}
