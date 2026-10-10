# Fact-check

On 2026-09-23 a research pass for the course's references flagged 150 claims in the lecture copy as wrong, overstated or unsourced. Each was re-checked against its source and either corrected or kept, and a second, independent pass reviewed every correction.

**132 fixed, 5 partly fixed, 13 kept** (the original was right, or no source could settle it). **26 further errors** were found and fixed along the way, and review corrected **26** of the fixes themselves.

Every correction was made in both registers — the card copy and the `say` narration — and, where a scene showed the wrong fact, in the 3D scene too. Corrected sentences carry citations where a source was read; the full lists are in each lecture's *Sources & credits*.

A few figures still rest on judgement rather than a source, and are worded to say so: the phone's sustained case power ("very roughly three to five watts") and how far a phone outruns the RAD750 ("many times over").

## chip

- **Fixed** · cache — 'a few kilobytes right beside the core'  
  L1D is 32-48 KB on current x86, 128 KB on M1; "a few" understates. ([source](https://www.7-cpu.com/cpu/Apple_M1.html))
- **Fixed** · transistor/arrive — 'tens of billions of these on the die'  
  Desktop x86 dies are single-digit to low-teens of billions; "billions" is safe and matches package/die. ([source](https://www.apple.com/newsroom/2023/10/apple-unveils-m3-m3-pro-and-m3-max-the-most-advanced-chips-for-a-personal-computer/))
- **Fixed** · transistor/switching — insulator ~1 nm, 'any thinner and electrons tunnel'  
  Tunnelling was already serious at 1.2 nm SiO2 (90/65 nm); Intel moved to hafnium high-k in 2007 (Penryn). ([source](https://spectrum.ieee.org/the-highk-solution))
- **Fixed** · transistor/switching — 'current flows: a 1' / 'a 0'  
  Conducting is not logic 1 (a conducting nMOS pulls output to 0, as the next beat shows). Now on/off. ([source](https://patents.google.com/patent/US3356858A/en))
- **Fixed** · adder/ripple — 'The answer arrives left to right'  
  Scene swept LSB-left, i.e. opposite to written binary. Reversed the scene sweep to right-to-left and copy now says lowest bit first, right to left as on paper.
- **Fixed** · package/die — 'developed twenty times over'  
  Leading-edge logic uses many dozens of mask layers; twenty is nearer the metal-layer count. WikiChip source unreachable (connection refused) so not re-read; the direction of the fix is safe. ([source](https://fuse.wikichip.org/news/3398/tsmc-details-5-nm/))
- **Fixed** · package/exploded — 'Six layers of packaging, and only one of them computes'  
  Seven items listed, and the die is not packaging.
- **Fixed** · cycle — four-step loop; 'overlaps dozens of instructions'  
  Adds the memory step (matches the five-stage time lecture) and "hundreds in flight" (Golden Cove ROB 512, Zen 4 320). Reason for ROB figures from research; not independently re-fetched.
- **Fixed** · gpu — one instruction applied to every lane; single chip-wide bar 'not a stylisation'  
  Lockstep is per warp (32) / wavefront; warps are independent. Copy now says groups; scene now sweeps four bands on independent phases. ([source](https://docs.nvidia.com/cuda/cuda-programming-guide/03-advanced/advanced-kernel-programming.html))
- **Fixed** · npu — 'Weights march in from one edge'; 'Nothing fetches, nothing decides'  
  TPU v1: weights preloaded from the top and held; data from the left; host pushes ~a dozen CISC instructions (not fetched). Copy says weights loaded then held, and "inside the array" nothing fetches/decides. Scene weight stream now runs only in a short load window. ([source](https://arxiv.org/abs/1704.04760))
- **Fixed** · lid — 'Silicon starts misbehaving around 100 C'  
  100 C is TJmax (vendor rating), not a failure point. ([source](https://www.intel.com/content/www/us/en/products/sku/230496/intel-core-i913900k-processor-36m-cache-up-to-5-80-ghz/specifications.html))
- **Partly fixed** · lid — 'one hot square centimetre' / 250 W  
  250 W checks (253 W max turbo). Die area unpublished and larger than 1 cm2; changed to "a few square centimetres". Stamp and hotplate comparisons left. ([source](https://www.intel.com/content/www/us/en/products/sku/230496/intel-core-i913900k-processor-36m-cache-up-to-5-80-ghz/specifications.html))
- **Fixed** · asic — 'Most silicon ever made is fixed-function'  
  Unverifiable, and microcontrollers (general-purpose) ship in tens of billions. Softened.
- **Kept** · substrate — 'Roughly half of the pins deliver current'  
  The claim holds (Pentium 4 478-pin: 264 VCC/VSS = 55%). The aside is kept. However the body and hover text contradicted it ("large majority"); see extra. ([source](https://www.intel.com/content/dam/support/us/en/documents/processors/pentium4/sb/30056103.pdf))

Also found and fixed:
- substrate — Contradicted the same beat's aside ("roughly half"); made consistent with the supported figure.
- glossary:oxide — Same wrong fact as transistor/switching.
- glossary:channel — Same conflation as switching.
- glossary:ihs — Same as lid.
- glossary:mac / glossary:cache / glossary:ripple — Aligned with the fixed beats.

Corrected again in review:
- substrate — 'around half' understates modern sockets: the board fixer's own count from Intel 655258 gives LGA1700 = 65% power/ground (BGA1744 = 50%, P4 = 55%). 'At least half' covers every figure and still agrees with the 'Roughly …
- adder/ripple — Bloated, and the spoken line ended on a fragment ('Rather than all at once.')
- asic — The aside says 'door key' and the say says 'car key' (this was already there before the fixes)
- jargon:transistor — The hover still said 'tens of billions', which contradicts the fixed transistor/arrive beat ('billions')

## memory

- **Fixed** · dram — 64 ms / 3.9 us / 32 ms above 85 C mixed generations  
  Micron DDR5 datasheet: 8192 REF in 32 ms up to 85 C (tREFI 3.9 us), 16 ms at 85-95 C (1.95 us). Copy now DDR5 throughout; scene refresh constant moved from 15.6 Hz (64 ms) to 31.25 Hz and the slow toggle to 60x. ([source](https://mm.digikey.com/Volume0/opasdata/d220001/medias/docus/7969/16gb-ddr5-sdram-dierevd.pdf))
- **Fixed** · dram — 'a cell left alone for a fraction of a second forgets'  
  Worst-case (leakiest) cells set the schedule; most cells retain far longer. Source (UMD refresh paper) not re-read; standard result. ([source](https://user.eng.umd.edu/~blj/papers/ieeetc65-1.pdf))
- **Fixed** · hbm — 'The walk shortens, so the trip shortens'  
  Aurora/Xeon Max: DDR idle latency lower than HBM in every mode (e.g. 96.3 vs 121.1 ns SNC4). HBM buys bandwidth. Copy rewritten; scene no longer moves main memory along the latency axis — it stacks in place and the request goes out as a wide burst. ([source](https://arxiv.org/abs/2504.03632))
- **Fixed** · whole — stacking 'shortening the walk'  
  Same as hbm. ([source](https://arxiv.org/abs/2504.03632))
- **Fixed** · l1 — label '32–64 KB'  
  M1 Firestorm L1D is 128 KB (3 cycles). ([source](https://www.7-cpu.com/cpu/Apple_M1.html))
- **Fixed** · ram — 'eighty to a hundred nanoseconds'  
  Zen 4 + DDR5-6000 measured 73.35 ns; M1 91 ns. ([source](https://chipsandcheese.com/p/amds-zen-4-part-2-memory-subsystem-and-conclusion))
- **Fixed** · ladder — 'a storage read over an hour'  
  At the 1e8 scale the drawn 40 us is ~67 min but the range gives 33 min–2 h; "around an hour".
- **Fixed** · ssd — 'nowhere for it to leak to. Years later it is still there'  
  Retention errors from charge leakage are the dominant flash error (Cai et al.). JESD218 client rating: 1 year unpowered at 30 C at rated endurance (from research; JEDEC doc not fetched). "Gate" replaced with "pocket" so it covers charge-trap 3D NAND too. ([source](https://arxiv.org/abs/1706.08642))
- **Fixed** · ssd — 'twenty to seventy microseconds'  
  No source for exact bounds; "tens of microseconds" in copy, label and readout. ([source](http://vldb.org/pvldb/vol14/p1311-suzuki.pdf))
- **Fixed** · wear — 'Every other component wears out from heat or vibration'  
  Transistors and wires also age with use; flash is distinctive for fast per-write wear.
- **Fixed** · unified — 'Traditionally a processor and a graphics unit each own their own memory'  
  True of discrete cards; integrated GPUs long shared DRAM. ([source](https://web.stanford.edu/~cgregg/chris-gregg/pubs/WhereIsTheData.pdf))

Also found and fixed:
- glossary:cell:capacitor — A cell is refreshed ~31 times a second in DDR5 (refresh commands are what run thousands of times a second).
- jargon:hbm — Same wrong mechanism as hbm.
- glossary:ladder:stack — Same wrong mechanism as hbm.

Corrected again in review:
- hbm — The opening narration line still set stacking up as the fix for distance, which the rewritten beat now denies
- glossary:cell:capacitor — 'dozens of times a second': 31/s is better said as the 'about thirty' the beat uses

## time

- **Fixed** · overlap — 'five times the work'  
  Ideal only; uneven stages, latch overhead and stalls reduce it. ([source](https://acg.cis.upenn.edu/milom/cis371-Spring13/lectures/05_pipeline.pdf))
- **Fixed** · hazard — dependent instruction 'cannot start — and neither can anything behind it'  
  Forwarding removes most such stalls; load-use still stalls. Scene bubbles kept (they now stand for the unforwardable case), comment updated. ([source](https://acg.cis.upenn.edu/milom/cis371-Spring13/lectures/05_pipeline.pdf))
- **Fixed** · hazard — 'The pipeline inserts nothing'  
  The interlock inserts a nop: a bubble. ([source](https://acg.cis.upenn.edu/milom/cis371-Spring13/lectures/05_pipeline.pdf))
- **Fixed** · speculation — 'the discarded work is a small tax'  
  H&P: on average 19% of instructions wasted on a Core i7 (SPECint). ([source](https://www.doc.ic.ac.uk/~wl/teachlocal/arch/papers/cacm19golden-age.pdf))
- **Fixed** · depth — deeper pipelines 'was how clock speeds climbed'  
  Hrishikesh et al.: technology (8x) and less logic per stage (7x) contributed roughly equally. ([source](https://www.cs.utexas.edu/~skeckler/pubs/isca02.pdf))
- **Fixed** · wall — 'Dennard scaling held until around 2005'  
  H&P: began to slow significantly in 2007, faded to almost nothing by 2012. "Mid-2000s". ([source](https://www.doc.ic.ac.uk/~wl/teachlocal/arch/papers/cacm19golden-age.pdf))
- **Fixed** · wall — 'cancelled a 4 GHz part in 2004 over exactly this'  
  Stated reason: move people onto dual-core; heat is the Register's reading. ([source](https://www.theregister.com/2004/10/14/intel_kills_4gh/))
- **Fixed** · wall — 'Clocks have sat around 4–6 GHz ever since'  
  Fastest in 2004 was 3.8 GHz (kept as flagship); top boost today 6.2 GHz (14900KS). ([source](https://www.intel.com/content/www/us/en/products/sku/237504/intel-core-i9-processor-14900ks-36m-cache-up-to-6-20-ghz/specifications.html))
- **Fixed** · wall — P = C V^2 f without activity factor  
  Added the switching share (alpha). ([source](https://pages.hmc.edu/harris/cmosvlsi/4e/lect/lect7.pdf))
- **Partly fixed** · cores — two 3 GHz cores burn far less than one at 6  
  A model argument; now states the lower-voltage assumption and perfect splitting, readout labelled "(model)". Harris lecture not re-read; no vendor measurement exists for these figures.
- **Fixed** · clock — 'proving that a million such decisions can never disagree is far harder'  
  Softened to design/verification cost; clockless chips exist. Sutherland not re-read. ([source](https://www.eng.auburn.edu/~uguin/teaching/READING/E6200/Micropipeline_sutherland.pdf))

Also found and fixed:
- time.ts header comment — Same as wall; comment only.

Corrected again in review:
- hazard — Self-contradictory: 'it has to wait. Most of the time ... nothing is lost'. Also wordy.
- wall — The number had no unit

## fab

- **Fixed** · dies — a ring of partial dies around the rim is thrown away before anything is even printed  
  Edge fields are exposed too (dummy shots) so CMP/etch see a uniform pattern; they are lost, but after printing. Scene previously drew no partial dies at all; added an EdgeDies ring (wafer circle clipped to each die square) that prints with its neighbours and then reads as scrap,… ([source](https://patents.google.com/patent/US8685633B2/en))
- **Fixed** · expose — The entire field appears at once, in a flash.  
  ASML: reticle moves through a narrow slit of light while the wafer moves the opposite way. Copy now says the mask carries every feature and a slit sweeps across the field in one pass; "Flash the light through" -> "Shine the light through". Scene beam now becomes a narrow slit th… ([source](https://www.asml.com/en/technology/lithography-principles/mechanics-and-mechatronics))
- **Fixed** · expose — Every other way of making things involves a tool travelling over the work.  
  Overstatement (casting, stamping, printing presses) — sentence removed; replaced by the accurate contrast with drawing line by line. ([source](https://www.asml.com/en/technology/lithography-principles/mechanics-and-mechatronics))
- **Fixed** · stepper — A modern fab runs this loop day and night for weeks  
  SemiEngineering: cycle time 80-85 days at 7 nm, ~100 at 5 nm; 80-100 mask layers. Also overlay: ASML NXT:2100i single-machine 0.9 nm / matched 1.3 nm, so "a few nanometres" -> "a nanometre or two". Kicker "The stepper" -> "Step and scan"; "One flash" -> "One exposure". Glossary … ([source](https://semiengineering.com/battling-fab-cycle-times/))
- **Fixed** · euv — A handful of machines in the world can do it  
  ASML shipped its 100th EUV system in early 2020; the scarcity is the supplier (EUV is "unique to ASML"). ([source](https://www.asml.com/en/products/euv-lithography-systems))
- **Fixed** · node — The correspondence came apart in the late 1990s  
  IEEE Spectrum: "In the mid-1990s, the two features began to uncouple"; example switched to Spectrum's own (130 nm node, 70 nm gates) in place of the uncited 90/50. ([source](https://spectrum.ieee.org/a-better-way-to-measure-progress-in-semiconductors))
- **Fixed** · node — Node names used to track a real dimension - the spacing between neighbouring features  
  Spectrum: the node number tracked gate length and metal half-pitch. ([source](https://spectrum.ieee.org/a-better-way-to-measure-progress-in-semiconductors))
- **Fixed** · node — was gone entirely by around 28 nm  
  No source for 28 nm; Spectrum shows Intel 22 nm still had 26 nm gates. Specific cutoff dropped; replaced by "Nothing on it measures three" (Wikipedia 3 nm: the term has no relation to any physical feature). ([source](https://spectrum.ieee.org/a-better-way-to-measure-progress-in-semiconductors))
- **Fixed** · node — A part sold as "3 nm" has gates nearer 16 to 18 nanometres  
  Gate length is undisclosed/unverifiable (IRDS table is an image, TSMC did not publish Lg). Replaced with the verifiable contacted gate pitch ~45 nm (TSMC N3, IEDM 2022) alongside the confirmed 23 nm metal pitch. ([source](https://semiwiki.com/semiconductor-manufacturers/tsmc/322688-iedm-2022-tsmc-3nm/))
- **Fixed** · yield — Double the die area and each one is twice as likely to catch a defect  
  Poisson Y=exp(-A*D0): expected defects per die double, but the clean fraction squares (0.75^2=0.5625). Copy now says twice as many on average and the clean share falls faster than area; aside gives the 75%->56% example. "Defects land at random" -> "Defects are scattered across t… ([source](https://www.imec-int.com/en/articles/when-does-it-make-sense-move-monolithic-asic-chiplet-based-design))
- **Fixed** · layers — A stack twelve prints deep is twelve chances to be slightly out.  
  SemiEngineering: 80-85 mask layers at 7 nm, ~100 at 5 nm. Scene still draws 12 layers; aside now says the twelve drawn are a sketch. ([source](https://semiengineering.com/battling-fab-cycle-times/))

Also found and fixed:
- euv — The readout presented wavelength/pitch as a resolution shortfall; 193 nm immersion resolves well below its wavelength (just not a 30 nm pitch in one exposure). Value now states the ratio honestly.
- fab file header — Same wrong facts in the file doc comment.

Corrected again in review:
- yield — The new sentence was wrong: 'the share that come out clean falls faster than the area grows'. Area doubles (x2) while the clean share falls 75% -> 56% (x0.75), so it does not fall 'faster'. The real point is cost per go…

## board

- **Fixed** · whole — a single sheet of fibreglass about two millimetres thick  
  APTPCB: laptop mainboards 1.0-1.6 mm total thickness (vendor blog, weak but consistent with the 1.6 mm standard). Glossary pcb fact also said "about 2 mm". ([source](https://aptpcb.com/en/blog/laptop-pcb))
- **Fixed** · pcie — Storage gets four wires instead of dozens  
  x4 = four lanes, each a TX pair and an RX pair = 16 wires. Scene drew PCIe as 4 single lines; now 8 lines (4 lanes x 2 pairs), alternate lines run opposite ways (existing full-duplex logic keys on line index). New jargon "four lanes" (PCIe) entry, restricted to board; the GPU "l… ([source](https://lenovopress.lenovo.com/tips0456))
- **Fixed** · usb — run at the speed of the world outside, many orders of magnitude slower than the silicon  
  USB4 is up to 80 Gb/s, comparable to a PCIe Gen4 x4 SSD (~63 Gb/s); memory ~600+ Gb/s. Now "most of these are slow", Wi-Fi a gigabit or two vs hundreds for memory, and the slow thing is whatever is on the other end. Glossary ports fixed. ([source](https://www.usb.org/usb4))
- **Fixed** · ddr — dozens of wires ... all of which must arrive together  
  Matching/training is per byte lane against its DQS strobe. Copy now says groups of eight, each with its own timing signal. Scene's 9 DDR lines reinterpreted (comment) as one byte group: 8 DQ + strobe, so the lockstep animation stays honest. ([source](https://www.ti.com/lit/pdf/sprad06))
- **Fixed** · traces — every bit in the group arrives on the same clock edge; at a 4 GHz clock, about 4 cm per tick  
  4 GHz is the core clock, not the memory bus. Recomputed for DDR5-4800: 4.8 GT/s -> ~208 ps per bit -> ~3.1 cm at 15 cm/ns. "same clock edge" -> "arrives together". ([source](https://www.ti.com/lit/an/scaa082a/scaa082a.pdf))
- **Fixed** · vrm — A laptop processor at full tilt can draw over a hundred amps at about a volt  
  Intel 12th Gen datasheet VCCCORE IccMAX: H 45W 160 A, H 4+8 120 A, P 28W 109 A, P 4+8 85 A, U15 80 A. IccMax is what the regulator must be built for. Glossary vrm fact fixed. ([source](https://cdrdv2-public.intel.com/655258/655258-011.pdf))
- **Fixed** · fan — This is the one moving part in the entire machine  
  Speakers, keys, hinges also move. Now "the only moving part on the board"; also "the only thing that can" -> "the only thing that can do it quickly" (fanless laptops rely on slow natural convection). Glossary fan fixed.
- **Fixed** · pcb — (aside) the colour is a convention inherited from the pigments that happened to work  
  Origin of green solder mask is undocumented lore. Softened to "mostly convention — nobody quite agrees how green won". ([source](https://www.wevolver.com/article/why-are-circuit-boards-green))
- **Kept** · rails — Half the pins on the chip were power and ground  
  Verified against Intel 12th Gen ballout spreadsheets embedded in datasheet 655258: H/P/U15 BGA1744 has 593 VSS + 277 VCC balls of ~1744 (~50%); S LGA1700 has 709 VSS + 401 VCC of 1700 (~65%). "Half" is right, if anything conservative. (The adjacent "Half the layers" sentence was… ([source](https://cdrdv2-public.intel.com/655258/655258-011.pdf))
- **Kept** · exploded — the two that are not the computer take up most of the volume  
  Plausible and true of the scene as drawn; no contrary evidence found, and the battery beat makes the same claim. Left unsourced.
- **Kept** · budget — (aside) An implant gets twenty-five milliwatts  
  Owned by the implant agent per instructions; already changed on disk by them to "a few tens of milliwatts".

Also found and fixed:
- pcb / rails — APTPCB 10-layer laptop example: 2 ground + 2 power planes, 6 signal; TI SCAA082A: 2 of 4 or 2-3 of 6 are planes. "Most" was wrong and contradicted the rails beat's "half"; both now say "close to half". Glossary pcb line…

Corrected again in review:
- ddr — 'dozens of wires' in the same lecture as 'the memory bus's hundred or so' (pcie beat) and the glossary's 'hundred-odd'
- whole — The body said 'the last lecture inside' and the say said 'four lectures inside'. The last lecture was fab, which is not inside the chip.

## io

- **Fixed** · display — the instant anything moves, the whole frame is sent again  
  PSR2 selective update (eDP) and command-mode DSI panels can send only the damaged region. ([source](https://github.com/torvalds/linux/blob/master/drivers/gpu/drm/i915/display/intel_psr.c))
- **Fixed** · interrupt — (aside) The processor pushes what it was doing onto a stack ... puts everything back  
  Hardware saves only a minimal context (PC, flags, a few registers); the handler/OS saves the rest. OSTEP ch. 6 confirms. ([source](https://pages.cs.wisc.edu/~remzi/OSTEP/cpu-mechanisms.pdf))
- **Fixed** · interrupt — everything freezes — not slows, freezes — until the interrupt has been serviced  
  Only the interrupted program stops; the processor is busy running the handler, and DMA/other cores carry on. The board scene also drew the processor DARK during the stall (as if idle) — now it flares while the program's traffic is frozen. ([source](https://pages.cs.wisc.edu/~remzi/OSTEP/file-devices.pdf))
- **Kept** · cost — On a busy network link that can arrive tens of thousands of times a second  
  "That" is the interrupt, not the packet. With coalescing/NAPI, tens of thousands of interrupts per second is a realistic figure for a busy NIC; the research itself calls it "not wrong as a lower bound". Readout (fixed 1.5 s service vs shrinking period) is a schematic and unaffec… ([source](https://docs.kernel.org/networking/napi.html))

## boot

- **Fixed** · firmware — When reset releases ... What lives there is firmware: code in flash on the board itself  
  True of a classic PC. On AMD Zen the PSP runs an on-chip boot ROM, initialises DRAM and only then releases the x86 cores; on iPhone the first stage is mask ROM on the SoC. Qualified with "On a classic PC" and added an aside + say line. ([source](https://doc.coreboot.org/soc/amd/family17h.html))
- **Fixed** · firmware — code in flash on the board itself (Apple)  
  Covered by the same aside: iPhone Boot ROM is laid down during chip fabrication and immutable. ([source](https://support.apple.com/guide/security/boot-process-for-iphone-and-ipad-devices-secb3000f149/web))
- **Kept** · post — So it asks, and configures the memory controller before memory can be used at all  
  Research itself says correct. The AMD nuance (PSP firmware trains DRAM before x86 runs) is now covered by the firmware-beat aside; it is still firmware configuring memory. ([source](https://doc.coreboot.org/getting_started/architecture.html))
- **Fixed** · find — reads the first few sectors of each looking for something it recognises ... small and dumb on purpose  
  Legacy BIOS/MBR only. UEFI follows boot variables to a named .EFI file on the EFI System Partition. Now gives both. Dropped "dumb" (UEFI loaders are not); kept "small" relative to the kernel. UEFI spec could not be fetched (403) — no cite. ([source](https://uefi.org/specs/UEFI/2.10/02_Overview.html))
- **Fixed** · loader — A few hundred bytes of firmware entry, then firmware, then a loader, then a kernel  
  "A few hundred bytes" is the legacy MBR loader stage, not firmware entry (reset vector holds a jump). ([source](https://cdrdv2.intel.com/v1/dl/getContent/671447))
- **Fixed** · kernel — switch on address translation  
  64-bit Linux boot protocol requires paging already enabled at entry; the kernel installs its own page tables. ([source](https://www.kernel.org/doc/html/latest/arch/x86/boot.html))
- **Kept** · kernel — That transition happens once per boot and is never undone while the machine is up  
  The claim is about the wall between kernel and programs. SMM runs beneath the OS but does not lower the wall for programs; kexec/hibernate-resume are re-runs of the boot chain, i.e. a new boot. Research itself rates it "minor". ([source](https://cdrdv2.intel.com/v1/dl/getContent/671447))

Also found and fixed:
- firmware (glossary boot:firmware / jargon firmware) — Same fact as the firmware item, in hover text and the in-text definition.
- find (jargon sectors) — Legacy-only, same as the find item.

Corrected again in review:
- kernel — 'the boundary from Lecture 8' reads as a backward reference in Lecture 7. The say already says 'the next lecture'.

## kernel

- **Fixed** · wall — (aside) Every attempt to enforce isolation in software alone has failed  
  Counter-example: software fault isolation (Wahbe et al. 1993), JVM/Wasm/eBPF. Rephrased to the defensible claim. ([source](https://doi.org/10.1145/168619.168635))
- **Partly fixed** · wall — The processor has a mode bit ... That single bit is the wall  
  Kept the pedagogical "mode bit" but added that real processors have a few levels (x86 rings 0-3, Arm EL0-3). The MMU page-table point was not added: the copy already says the protected instruction includes touching another program's memory, and only privileged code can change tr… ([source](https://cdrdv2.intel.com/v1/dl/getContent/671447))
- **Fixed** · syscall — the crossing is the expensive part, not the work  
  FlexSC measured the mode switch at ~150 cycles (less than one cache miss); the larger cost is indirect cache/TLB/predictor pollution. ([source](https://www.usenix.org/legacy/event/osdi10/tech/full_papers/Soares.pdf))
- **Fixed** · schedule — Your machine ... does one thing at a time  
  True per core; machines have several cores. ([source](https://pages.cs.wisc.edu/~remzi/OSTEP/cpu-sched.pdf))
- **Fixed** · preempt — (aside) Early systems relied on programs voluntarily yielding  
  CTSS (1961-62) was already preemptive; OSTEP names early Mac OS and the Xerox Alto as cooperative. ([source](https://pages.cs.wisc.edu/~remzi/OSTEP/cpu-mechanisms.pdf))
- **Fixed** · isolation — Neither can name the other's, because it has no way to express it  
  Shared memory / MAP_SHARED lets the kernel deliberately map the same memory into two processes. ([source](https://pages.cs.wisc.edu/~remzi/OSTEP/vm-mechanism.pdf))

Also found and fixed:
- user — Any process can list others (ps, /proc) through system calls; what they cannot do is find out on their own. Also "none can read the disk" is only true without asking.

## os

- **Fixed** · trade — (aside) Windows and macOS both keep a small privileged core with a great deal built around it  
  In NT the memory manager, cache manager, file systems, network stack and (since 4.0) USER/GDI run in kernel mode; Microsoft calls it a "modified microkernel or macrokernel". In XNU Mach, BSD and I/O Kit share kernel space. ([source](https://learn.microsoft.com/en-us/previous-versions/cc750820(v=technet.10)))
- **Fixed** · families — Windows NT was designed with a small privileged core and services around it, then moved graphics inside for speed  
  From its first release NT ran memory, cache, file systems, security, networking in kernel mode; only environment subsystems and graphics (until 4.0) were user mode. ([source](https://learn.microsoft.com/en-us/previous-versions/cc750820(v=technet.10)))
- **Fixed** · families — macOS puts a BSD layer on top of a Mach-derived core  
  Added that both run inside the same wall (kernel space). Original anchor substring kept intact. ([source](https://developer.apple.com/library/archive/documentation/Darwin/Conceptual/KernelProgramming/Architecture/Architecture.html))
- **Fixed** · micro — checked at every boundary it meets. The path is the cost.  
  Not wrong, but Liedtke showed much of the historical penalty was implementation, not the idea. Added an aside and say line; no numbers. ([source](https://doi.org/10.1145/224056.224075))
- **Fixed** · rtos — A system that always responds in 50 ms is real-time; one that usually takes 1 ms and occasionally 100 is not  
  Real-time is relative to a deadline; stated one (60 ms). Scene readout shows deadline as % of period, unaffected. ([source](https://doi.org/10.1145/321738.321743))
- **Fixed** · embedded — The overwhelming majority of running operating systems are small real-time kernels inside things nobody calls a computer  
  Unsupportable as a count of OSes (many embedded parts are bare metal). Rephrased to most computers being small controllers, whose OSes (when they have one) are mostly small RTOSes. Heading changed from "Most operating systems are not the ones you have heard of" to "Most computer…
- **Fixed** · embedded — a hundred separate units in a car  
  IEEE Spectrum: 70-100 ECUs in premium cars. ([source](https://spectrum.ieee.org/this-car-runs-on-code))

Corrected again in review:
- embedded — 'up to a hundred separate units in a car' turned an approximation into a cap that is false for premium cars (the fixer's own IEEE Spectrum source gives 70-100 in 2009; more since). The car lecture says 'dozens'; match i…

## compile

- **Fixed** · compile — One readable line up here is nine instructions one level down  
  Count depends on ISA/compiler/optimisation. Copy now says "this line" and that the count varies; scene readout "9, in this example".
- **Fixed** · expand — arrives at the bottom as 288 ones and zeros  
  288 = 9 x 32 assumes a fixed 32-bit encoding; x86-64 is 1-15 bytes. Copy names the assumption; CodeScene readout adds an Encoding row and the comment notes x86. ([source](https://docs.riscv.org/reference/isa/v20260120/unpriv/rv32.html))
- **Fixed** · expand — Nothing was added and nothing was lost.  
  Compilation discards names/types/comments and adds/removes code; what survives is meaning. ([source](http://infolab.stanford.edu/~ullman/dragon.html))
- **Fixed** · isa — these bit patterns mean these operations, forever ... any program ever compiled for it will run  
  ISAs extend, and occasionally retire instructions (AAA is #UD in x86-64 64-bit mode). ([source](https://cdrdv2-public.intel.com/819712/253666-sdm-vol-2a.pdf))
- **Partly fixed** · isa — indistinguishable from having obeyed one instruction at a time  
  Scoped to "for any one program" (single-thread architectural state). Did not add a multi-core memory-model caveat — judged too deep for this beat; the timing leak is covered in the speculation beat. ([source](https://doi.org/10.1145/1785414.1785443))
- **Fixed** · speculation — nothing about the result you got reveals which  
  Spectre: cache state is not reverted, so discarded work is observable via timing. Added one-line caveat (new say line). ([source](https://spectreattack.com/spectre.pdf))
- **Fixed** · halfadder — an XOR for the sum and an AND for the carry ... repeated once per bit  
  Half adders cannot take a carry-in; each bit needs a full adder (two half adders + OR), consistent with Lecture 1's full-adder beat. Scene (shared adder scene) left as the half adder it is. Did not mention lookahead adders. ([source](https://csg.csail.mit.edu/6.175/labs/lab1-multiplexers-adders.html))
- **Fixed** · channel — each transistor is this: a voltage on a gate, a layer of electrons pulled into existence beneath it  
  Half of a CMOS gate is p-channel (holes, on when gate low). Added sentence + new jargon entry "holes" (compile only). Shared mosfet scene is an nMOS and stays. ([source](https://www.computerhistory.org/siliconengine/complementary-mos-circuit-configuration-is-invented/))
- **Fixed** · overlap — finishes five ticks later — with four others in flight around it  
  Ideal classic 5-stage pipeline only; added "if nothing holds it up". ([source](https://shop.elsevier.com/books/computer-architecture/hennessy/978-0-443-15406-5))
- **Kept** · whole — run inside a skull on twenty-five milliwatts  
  Owned by the implant agent; already changed on disk by them to "a few tens of milliwatts".

Corrected again in review:
- speculation — New copy names the Spectre attacks; no jargon entry existed, so the term was bare.

## phone

- **Fixed** · prime — The energy cost of a task is roughly fixed, but the cost of being ready is not  
  Energy per task depends on core type and OPP (that is what EAS models). Replaced with little-core efficiency + race-to-idle. ([source](https://docs.kernel.org/scheduler/sched-energy.html))
- **Fixed** · prime — (aside) one to three prime cores, three or four mid cores, and two to four efficiency cores  
  A18 Pro is 2P+4E (Apple newsroom); Dimensity 9300 is 4 X4 + 4 A720, "All Big Core". Scene shows 2 prime + 4 little, which matches the A18 Pro shape, so unchanged. ([source](https://www.mediatek.com/products/smartphones-2/mediatek-dimensity-9300))
- **Fixed** · scheduler — This is Lecture 9's scheduler again  
  Scheduler is Lecture 8 (kernel, chapter "turns"); lectures.ts: kernel=8, os=9.
- **Fixed** · die — Processor, graphics, memory, radio ... Here they are one piece of silicon  
  DRAM is separate dies stacked package-on-package; iPhone modems are separate chips. Now "one package: most of them on one piece of silicon, with the memory stacked directly on top". Also glossary phone:die and the lecture subtitle. No source fetched (glossary phone:mem already s…
- **Fixed** · compare — None of that survives ... a phone with a tired battery is a phone at the end of its life  
  Batteries are routinely replaced by service centres. Heading "Nothing here can be replaced" -> "Nothing here is meant to be replaced"; budget beat "nothing replaceable" -> "almost nothing replaceable". EU 2023/1542 not cited (unfetched).
- **Fixed** · sealed — A laptop had a heat pipe, a fin stack and a fan. A phone has none of those.  
  iPhone 17 Pro and many Android flagships ship vapour chambers (flat heat pipes). Anchor sentence kept intact. ([source](https://www.apple.com/newsroom/2025/09/apple-unveils-iphone-17-pro-and-iphone-17-pro-max/))
- **Kept** · sealed — what the case can shed continuously — very roughly three to five [watts]  
  Not shown wrong and already hedged ("very roughly"); no source either way (web search budget exhausted, Bhat et al. abstract gives no number). Left as is, including the 3-5 W readout in phoneLayout.ts and glossary phone:sustained. NEEDS A SOURCE before it gets a citation — coord… ([source](https://arxiv.org/abs/1904.09814))
- **Kept** · throttle — (aside) The governors are holding the case somewhere around 43-48 °C  
  Unverified rather than wrong; could not find a source (search budget exhausted). Left as is. Coordinator: either source it (IEC 62368-1 touch-temperature limits / a vendor thermal doc) or soften to "the mid-forties Celsius". ([source](https://arxiv.org/abs/1904.09814))
- **Fixed** · gating — cut off from the supply entirely and drawing nothing, and it can be brought back in microseconds  
  Gated blocks still leak a little through the header switch; wake time depends on the block. Hedged; no vendor doc fetched.
- **Fixed** · dark — transistors kept shrinking after the power per transistor stopped falling with them  
  Power per transistor still falls, just more slowly than area (supply voltage stopped scaling). ([source](https://research.cs.wisc.edu/vertical/papers/2011/isca11-darksilicon.pdf))

Also found and fixed:
- dark — Same leakage point as the gating item.
- budget — Follows from the compare fix.
- (subtitle, lectures.ts) — Same memory-on-die fact.

Corrected again in review:
- gating — Unsourced wake time 'microseconds for a small block, longer for a whole cluster' understates: Snapdragon 8 Gen 2's own idle states give a single core 750-1,350 us to come back from power collapse and a cluster 2,350 us.…
- throttle — Unsourced '43-48 °C'. Google's shipped Pixel thermal configs throttle on skin temperature at 39 (light), 43 (moderate), 45 (severe), 46.5 (critical); 48 is above where the governor holds it.
- sealed — 3-5 W still has no source (I could not find one either: no web search budget left). Copy already says 'very roughly'; the glossary card and readout stated it flat. Softened those to match the copy.

## edge

- **Fixed** · determinism — No scheduler deciding, no cache sometimes missing ... the same number of microseconds, on every run, forever  
  ESP32 runs from external flash through a 2-way set-associative 32 KB cache per CPU; interrupts add jitter. Heading "the same time" -> "nearly the same time". ([source](https://documentation.espressif.com/esp32_datasheet_en.pdf))
- **Fixed** · noos — There is no wall, no privilege boundary, no address translation ... runs a single program that owns everything  
  No MMU is right; but Cortex-M parts often have privilege levels + MPU, and Zephyr uses them to isolate user threads. Heading "Nothing here is protecting..." -> "Almost nothing here is protecting...". Kicker "No operating system" left (matches lecture framing). ([source](https://docs.zephyrproject.org/latest/kernel/usermode/overview.html))
- **Fixed** · noos — a bug here is not a crashed application — it is a brick  
  The next beat's watchdog means a hang is a reset, not a brick; bricking comes from failed updates/bootloader corruption. ([source](https://www.ti.com/lit/SLVAE47))

Also found and fixed:
- (glossary edge:core) — Same fact as determinism/noos (ESP32 has caches; RTOSes common).
- (glossary edge:flash) — ESP32 keeps its program in external QSPI flash.

Corrected again in review:
- determinism — Missed by everyone: 'Lectures 2, 3 and 9' — the scheduler that makes an average fast is Lecture 8 (kernel, chapter 'Taking Turns'); Lecture 9 is the OS lecture. The phone fixer made the same 9->8 correction.

## car

- **Fixed** · zonal — most manufacturers have already left function-based wiring  
  McKinsey/GSA (read): ~18% of vehicles zonal in 2030, 48% domain, 34% distributed. Rivian Gen-2 R1 page (read): zonal, >1.6 miles / 20 kg of wiring removed. ([source](https://www.gsaglobal.org/wp-content/uploads/2023/06/2023-June-Final-Report-GSA-McK-Getting-ready-for-next-generation-E_E.pdf))
- **Fixed** · nondestructive — the most urgent message always gets through immediately / did not delay it  
  Arbitration costs the winner nothing (Bosch spec: neither information nor time is lost), but CAN is non-preemptive: a queued urgent frame waits for the frame in flight (Davis et al.). Kept "did not delay it" (true of the contention itself); replaced "immediately". ([source](https://link.springer.com/article/10.1007/s11241-007-9012-7))
- **Fixed** · nondestructive — Nothing has to be sent again  
  True only for the winner; losers retry at the next bus-idle (Bosch spec). ([source](https://www.nxp.com/docs/en/reference-manual/BCANPSV2.pdf))
- **Fixed** · lifetime — That is why a car does not run the newest process node  
  McKinsey: latest zonal-controller SoCs at 16 nm and below; NVIDIA DRIVE Thor on 4 nm (TrendForce, per research). Scoped to the safety controllers. ([source](https://www.gsaglobal.org/wp-content/uploads/2023/06/2023-June-Final-Report-GSA-McK-Getting-ready-for-next-generation-E_E.pdf))
- **Fixed** · lifetime — qualified from forty below to a hundred and twenty-five above  
  AEC-Q100 Table 1: Grade 1 is -40..125 C, Grade 0 -40..150 C (AURIX TC3x is Grade 0). Added "typically" and the 150 C case. ([source](http://www.aecouncil.com/Documents/AEC_Q100_Rev_J_Base_Document.pdf))
- **Fixed** · lifetime — Expected to work for fifteen years  
  15 years is the ZVEI example OEM mission profile, not a rule; presented as a typical target ("around fifteen years"). ([source](https://www.zvei.org/fileadmin/user_upload/Presse_und_Medien/Publikationen/2015/mai/Handbook_for_Robustness_Validation_of_Semiconductor_Devices_in_Automotive_Applications__3rd_edition_/Robustness-Validation-Semiconductor-2015.pdf))
- **Fixed** · bus — One bus runs the length of the car and every unit hangs off it  
  Real cars have several CAN buses at different speeds plus LIN, joined by gateways (Davis et al. sec 1.2). Scene still draws one bus, which the new qualifier covers. ([source](https://link.springer.com/article/10.1007/s11241-007-9012-7))
- **Fixed** · harness — The harness became one of the heaviest and most expensive parts of a vehicle  
  No primary ranking source. Replaced with sourced figures: "tens of kilograms of copper" (Davis et al.), "20 percent of total E/E architecture budgets" (McKinsey/GSA, read), high share of manual work (Procedia CIRP 2019, per research). ([source](https://www.gsaglobal.org/wp-content/uploads/2023/06/2023-June-Final-Report-GSA-McK-Getting-ready-for-next-generation-E_E.pdf))
- **Kept** · zonal — The wiring on screen halves  
  Describes the scene readout (measured on screen), not an industry figure; the added Rivian figure now gives the real-world number alongside it. ([source](https://rivian.com/stories/meet-the-new-r1))
- **Fixed** · asil — A braking function is rated at the highest safety level  
  ISO 26262 rates hazardous events/safety goals, not functions; braking goals are typically ASIL D. ISO text not read (paywalled), so no citation added. ([source](https://www.iso.org/standard/68387.html))
- **Fixed** · lockstep — identical instructions on identical data  
  Infineon AURIX: "Diverse Lockstep Core with clock delay" (per research, PDF). Added the clock-delay nuance; glossary car:shadow "in the same cycle" softened to match. ([source](https://www.infineon.com/assets/row/public/documents/10/43/infineon-aurix-automotive-presentations-en.pdf))

Also found and fixed:
- (lecture subtitle) — Lockstep detects failure, it does not prevent it; the lecture itself says "must not fail".
- (header comment) — Same wrong claim in the source comment.

Corrected again in review:
- zonal — Imperial units in a British-spelling course; Rivian's own page gives the metric figure.
- lifetime — The fix left three em-dash clauses in one sentence; the last one is now a comma.

## robot

- **Fixed** · fast — runs somewhere between a hundred and a thousand times a second  
  Kept (true of the joint loop), and added that the drive current loop runs far faster: Synapticon (read) position/speed 4 kHz, current 16 kHz. ([source](https://www.synapticon.com/en/motion-control-academy/kaskadierte-positionsregelung))
- **Fixed** · split — a microcontroller, no operating system  
  micro-ROS (read) supports FreeRTOS, Zephyr, NuttX; inner loops usually run under a small RTOS. ([source](https://micro.vulcanexus.org/docs/overview/features/))
- **Fixed** · miss — When it is late the arm overshoots  
  Franka FCI (read): late/lost commands stop motion with communication_constraints_violation / discontinuity errors; 500 us read-to-write budget. Scene overshoot kept as the uncaught physics; copy adds that a watchdog turns it into a stop. ([source](https://frankarobotics.github.io/docs/troubleshooting.html))
- **Fixed** · predictable — aside vs narration name different trades  
  Narration now uses the aside framing (edge: power, car: safety, robot: time), which matches the car lecture ("The constraint was never speed").
- **Fixed** · predictable — an implant has twenty-five milliwatts, no way to be rebooted  
  See implant-power.json. ([source](https://ieeexplore.ieee.org/document/9492480/))

Corrected again in review:
- miss — 'stops the arm the moment a pass is late' overstates the fixer's own source: Franka's FCI stops with communication_constraints_violation when timing or packet loss constraints are violated, not on a single late pass (it…

## datacenter

- **Fixed** · ecc — a laptop can reasonably ignore it; nothing above notices  
  Schroeder et al. (read): about a third of machines see >=1 memory error/year; 1.3% of machines/year hit uncorrectable errors, which shut the machine down. ([source](https://research.google/pubs/dram-errors-in-the-wild-a-large-scale-field-study/))
- **Fixed** · rack — 7.5 kW 2025, just under 8 in 2026, eleven the most commonly reported  
  Uptime 2026 (read): average of modal densities >11 kW including high-density sites (9 kW in 2025); 7.8 kW without them (7.5 in 2025). 11 is not the mode. ([source](https://datacenter.uptimeinstitute.com/rs/711-RIA-145/images/UptimeInstitute.GlobalDataCenterSurvey.2026.pdf))
- **Fixed** · rack — fifty to seventy is now ordinary; the very densest reach a hundred and thirty  
  Schneider WP110 (read): AI clusters 30-100 kW/rack. Uptime 2026 (read): ~1 in 7 facilities have some racks >=50 kW, some above 100 kW. 130 kW likely dated by Vera Rubin. ([source](https://datacenter.uptimeinstitute.com/rs/711-RIA-145/images/UptimeInstitute.GlobalDataCenterSurvey.2026.pdf))
- **Fixed** · rack — Checked: comment 16 kW -> 27 kW  
  Comment contradicted the survey and the text; rewritten with the Uptime 2026 / Schneider / Google figures in both the lecture header and dcLayout.ts header. ([source](https://datacenter.uptimeinstitute.com/rs/711-RIA-145/images/UptimeInstitute.GlobalDataCenterSurvey.2026.pdf))
- **Fixed** · node — no screen and no battery  
  Barroso et al. (read, sec 4.3): Google puts batteries on server trays or rack modules. ([source](https://doi.org/10.1007/978-3-031-01761-2))
- **Fixed** · power — the hardware is not the recurring cost - the power is; an electricity bill with computers in it  
  Barroso et al. TCO (read, sec 6.3): case A server amortisation 61.9%, power+PUE ~7%; case B energy 19%, hosting (infrastructure+power) ~2x server cost. Heading changed too. ([source](https://doi.org/10.1007/978-3-031-01761-2))
- **Fixed** · power — The blue part reaches a processor  
  PUE denominator is all IT equipment (LBNL WP49 per research; Barroso sec 5.1.1). Also fixed the glossary dc:compute line and scene comments. ([source](https://datacenters.lbl.gov/sites/default/files/WP49-PUE%20A%20Comprehensive%20Examination%20of%20the%20Metric_v6.pdf))
- **Fixed** · cooling — moving air simply cannot remove - not inefficiently, but at all  
  Schneider WP110 (read): air supports ~20 kW/rack with containment, not suitable for AI clusters above that. ([source](https://media.datacenterdynamics.com/media/documents/Schneider_Electric_-_Modernization_WP110_V1.1_EN.pdf))
- **Fixed** · gather — the gather does not [get longer]  
  Barroso (read, p.163 / Tail at Scale): with fan-out to 100 servers, requests slower than the 99th-percentile go from 1% to 63%. The gather grows with N. Amdahl aside kept. ([source](https://research.google/pubs/the-tail-at-scale/))
- **Kept** · pue — a third / roughly a tenth  
  Uptime 2026 (read) industry average PUE 1.52 (~34% overhead); Google fleet 1.09 (~8%). Copy is fine; scene constants 1.6/1.1 unchanged. ([source](https://datacenter.uptimeinstitute.com/rs/711-RIA-145/images/UptimeInstitute.GlobalDataCenterSurvey.2026.pdf))

Also found and fixed:
- pue — Implant power claim; see implant-power.json.

Corrected again in review:
- node — 'a battery only for riding out a power cut' reads as if every server has one; Google's tray/rack batteries are one design, most servers rely on a room UPS and have none.

## extremes

- **Fixed** · nofix — round trip between eight and forty minutes  
  NASA M2M (read): one-way up to 21-23 min (round trip ~45); ESA ~4-24 min one-way. Added the ~26-month conjunction blackout (M2M, read). ([source](https://www.lpi.usra.edu/lunar/strategies/resources/M2M-ACR2023_MarsCommunicationDisruptionDelay.pdf))
- **Fixed** · strike — on the order of one upset per day  
  No generic source; replaced with the RAD750 datasheet rate (read via Wayback): <1.6E-10 errors/bit-day, and the per-bit framing. ([source](https://www.baesystems.com/en-us/dam/jcr:c297f318-c618-4015-9399-adf76ac5cf55/16-f78-RAD750-Component-datasheet-2025-web.pdf))
- **Fixed** · smaller — ECC cannot repair four adjacent ones  
  Ibe et al. (per research): MCUs in one word avoided by ECC + interleaving; MCU size grows to >100 bits. Scoped to "same word" and mentioned interleaving; aside/say "the existing answer" -> "the simplest answer". ([source](https://webhost.laas.fr/TSF/WDSN09/WDSN09_files/Texts/WDSN09-2-1-Ibe.pdf))
- **Fixed** · hard — latch-up ... that cell is not holding a value  
  NASA SEE spec / SEECA (per research): permanent stuck cell is a hard error; SEL is device-level, may or may not be destructive, power must be cut within ms. RAD750 datasheet (read): latchup-immune. Grey cells now = permanent damage, latch-up described separately. Jargon latch-up… ([source](https://nepp.nasa.gov/docuploads/6D728AF0-2817-4530-97555B6DCB26D083/seecai.pdf))
- **Fixed** · voter — Everything upstream is triplicated; the voter is not  
  Lyons & Vanderkulk 1962 (per research) analyse triplicated voters; only the final voter is necessarily single. ([source](http://bitsavers.informatik.uni-stuttgart.de/pdf/ibm/IBM_Journal_of_Research_and_Development/062/ibmrd0602F.pdf))
- **Fixed** · slow — A rover runs a chip from 1998  
  RAD750 first flight units 2005 (datasheet, read); the PowerPC 750 is the 1997/98 part. ([source](https://www.baesystems.com/en-us/dam/jcr:c297f318-c618-4015-9399-adf76ac5cf55/16-f78-RAD750-Component-datasheet-2025-web.pdf))
- **Fixed** · slow — The slowness is the hardening  
  Datasheet (read): hardness from 0.25/0.15 um rad-hard bulk CMOS process. Kept the charge/clock mechanism (Baumann), reframed the conclusion. ([source](https://www.baesystems.com/en-us/dam/jcr:c297f318-c618-4015-9399-adf76ac5cf55/16-f78-RAD750-Component-datasheet-2025-web.pdf))
- **Fixed** · slow — about ten million transistors  
  No primary source (datasheet has no count). Dropped. ([source](https://www.baesystems.com/en-us/dam/jcr:c297f318-c618-4015-9399-adf76ac5cf55/16-f78-RAD750-Component-datasheet-2025-web.pdf))
- **Fixed** · slow — Rated for roughly a million rads  
  Datasheet (read): 200 krad(Si) rad-tolerant 110-132 MHz; 1 Mrad(Si) rad-hard 200 MHz. ([source](https://www.baesystems.com/en-us/dam/jcr:c297f318-c618-4015-9399-adf76ac5cf55/16-f78-RAD750-Component-datasheet-2025-web.pdf))
- **Partly fixed** · slow — Your phone outruns it by a factor of thousands  
  RAD750 >400 DMIPS at 200 MHz (datasheet, read). Phone CPU figure not sourced; my estimate (8 cores x ~10-15k DMIPS) gives hundreds of times. Changed to "hundreds of times over" but no phone-benchmark source was read. ([source](https://www.baesystems.com/en-us/dam/jcr:c297f318-c618-4015-9399-adf76ac5cf55/16-f78-RAD750-Component-datasheet-2025-web.pdf))
- **Fixed** · neuro — "throw away the clock" illustrated by NorthPole  
  IBM blog (read): NorthPole is synchronous ("operations per core per cycle"), memory on chip next to compute, 25x frames/J vs 12-nm GPUs on ResNet-50, prototype. Loihi is asynchronous/event-driven (Davies 2021 per research). ([source](https://research.ibm.com/blog/northpole-ibm-ai-chip))
- **Fixed** · quantum — dilution refrigerator the size of a room; needs a building  
  IBM Goldeneye blog (read): standard fridges 0.4-0.7 m^3 experimental volume; Goldeneye 1.7 m^3 = "larger than three home kitchen refrigerators". ([source](https://www.ibm.com/quantum/blog/goldeneye-cryogenic-concept-system))

Also found and fixed:
- (glossary extremes:unit) — Mars closest approach is ~55 million km, so "a hundred million" is not always true.
- (jargon radiation-hardening) — Same overstatement as the slow beat: the RAD750 is bulk CMOS with a hardened process; slow clocks are a consequence.

Corrected again in review:
- slow — 'The slowness is part of the price of hardening, and partly a help' is clumsy (part ... partly).

## implant

- **Fixed** · warm — guidelines cap an implanted interface at roughly fifteen to forty milliwatts depending on how deep it sits  
  No rule is written in milliwatts. ISO 14708-1 cl.17 (read): no outer surface >2 C above 37 C. SCALO (read): 1 C limit; 15 mW used as a conservative cap for implants near the cortical surface, and the cap "depends on packaging, implantation depth". Serrano-Amenos 2023 (abstract r… ([source](https://archive.org/stream/gov.in.is.iso.14708.1.2000/is.iso.14708.1.2000_djvu.txt))
- **Fixed** · warm — must not warm by much more than a degree  
  Standard allows 2 C at the surface (ISO, read); research designs to ~1 C (SCALO, read; MINDFUL 1-2 C). Both now stated; label changed to "A degree or two, and no more". ([source](https://www.anuragkhandelwal.com/papers/scalo.pdf))
- **Fixed** · budget — paid for out of the same twenty-five milliwatts (and pipe: radio inside the same 25 mW)  
  24.7 mW is the recording SoC (Yoon et al., abstract read), not a whole-implant budget. Neuralink compression brief (read via Wayback): compression <10 mW including radio. ([source](https://web.archive.org/web/20250901131704/https://content.neuralink.com/compression-challenge/README.html))
- **Fixed** · spikes — smaller by a factor of about two hundred  
  Brief (read): ~200 Mbps raw vs ~1 Mbps radio, ">200x compression is needed". Yoon et al. (read): spike detection "can reduce off-chip bandwidth by 1250x". ([source](https://ieeexplore.ieee.org/document/9492480/))
- **Fixed** · array — Each carries sixteen recording sites  
  Neuralink (read): 1,024 electrodes across 64 threads; 16/thread is the average. ([source](https://neuralink.com/blog/prime-study-progress-update/))
- **Fixed** · array — every one of them is listening (all channels working)  
  Neuralink user-experience update (read via Wayback): "In the weeks following the surgery, a number of threads retracted from the brain, resulting in a net decrease in the number of effective electrodes." Used Neuralink wording, not the unconfirmed 85% figure. ([source](https://neuralink.com/blog/prime-study-progress-update-user-experience/))
- **Kept** · pipe — The only way out is a low-energy radio  
  Generic "low-energy radio" makes no Bluetooth claim; it is accurate as worded. ([source](https://www.scientificamerican.com/article/neuralinks-first-user-describes-life-with-elon-musks-brain-chip/))

Also found and fixed:
- warm — With no single ceiling (15 mW cortical estimate vs ~70 mW skull unit), "most of the way" cannot be sourced. What holds either way: 24.7 mW is the same order as the whole allowance.

Corrected again in review:
- warm — 'the same size as the whole allowance' overstates: against the ~70 mW (47-81) skull-unit estimate (the N1 sits in the skull) 25 mW is about a third, and the bar shows 24.7/40 = 62%. The point is it is a large share, not…
- pipe — The <10 mW figure is a requirement set for challenge entrants, not a measurement Neuralink 'gives'; 'allows' says what the brief does.
- array — Over-correction: 'sixteen a thread on average' adds a hedge and repeats the number ('1,024 ... so about a thousand'). 64 x 16 = 1,024 exactly; the per-thread count was not wrong, just not needed.

## The implant power claim, across the course

The rule is a temperature, not a wattage: ISO 14708-1 allows no implant surface more than 2 °C above body temperature, and brain-implant designers aim for about 1 °C. What that allows in power depends on the device and where it sits — published estimates run from about 15 mW for a small cortical implant to about 70 mW for a unit set into the skull. Neuralink's recording chip draws 24.7 mW (Yoon et al., 2021). Every lecture that mentions the implant now says "a few tens of milliwatts"; the "15–40 mW guidelines" figure came from a press release, not a standard.
