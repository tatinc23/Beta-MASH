// 90s Baby MASH - New and Improved Libraries

export const CATEGORY_INFO: {[key: string]: { name: string, icon: string }} = {
    Housing: { name: "Housing", icon: '🏠' },
    Spouse: { name: "Who You'll Marry", icon: '💕' },
    Job: { name: "Your Job", icon: '💼' },
    Ride: { name: "What You'll Drive", icon: '🚗' },
    Salary: { name: "Your Salary is", icon: '💰' },
    Kids: { name: "How Many Kids", icon: '👶' },
}

const SPOUSE_LIBRARY = {
  singlePlayer: {
    soloHeartthrobs: [
      "1997 Leonardo DiCaprio (Titanic premiere look)", "Brandy during the Cinderella press tour", "Aaliyah in the Try Again video", "Usher My Way era", "Freddie Prinze Jr. at the She's All That prom", "Jennifer Love Hewitt at the I Know What You Did Last Summer party", "Tia Mowry during Sister, Sister college years", "Lark Voorhies as Lisa Turtle", "Paul Rudd Clueless era", "Gabrielle Union Bring It On preview", "Seth Green as Oz (Buffy era)", "Lauryn Hill during The Miseducation tour", "Tyra Banks Fresh Prince cameo", "Mario Lopez as AC Slater", "Devon Sawa Now and Then bike scene", "Sarah Michelle Gellar in Buffy Season 3"
    ],
    altSceneCrushes: [
      "Gwen Stefani Tragic Kingdom era", "Shirley Manson Garbage tour", "Courtney Love Celebrity Skin era", "Billy Corgan Mellon Collie era", "Lenny Kravitz Are You Gonna Go My Way", "Alanis Morissette Jagged Little Pill energy", "Trent Reznor Fragile era", "Fiona Apple MTV VMA '97 honesty speech", "Chyna from WWF Attitude Era", "Lisa 'Left Eye' Lopes with flame goggles", "Fairuza Balk in The Craft", "Angela Chase's red hair", "Heath Ledger 10 Things I Hate About You", "D'Angelo untitled video vibe", "Erykah Badu Baduizm era", "Bjork Homogenic swan dream"
    ],
    cartoonIcons: [
      "Sailor Moon in full transformation", "Goliath from Gargoyles", "Batman Beyond's Terry McGinnis", "April O'Neil (90s TMNT cartoon)", "Rogue from X-Men: The Animated Series", "Max Goof in A Goofy Movie", "Trent Lane from Daria", "Helga Pataki (secret poetry included)", "Johnny Bravo (with a hairbrush)", "Darkwing Duck (cape and all)", "Lola Bunny Space Jam edition", "Spike Spiegel from Cowboy Bebop", "Sailor Jupiter with thunder", "Doug Funnie in Quailman costume", "Prince Eric from the Disney Renaissance", "Gadget Hackwrench (Rescue Rangers legend)"
    ],
    sportsLegends: [
      "Michael Jordan Game 6 energy", "Mia Hamm World Cup victory lap", "Allen Iverson Rookie of the Year swagger", "Shawn Kemp Dunk Contest hype", "Lisa Leslie WNBA debut era", "Tony Hawk Pro Skater cover pose", "Kerri Strug Olympic hero", "Grant Hill Sprite commercial charm", "Andre Agassi neon headband era", "Serena Williams Wimbledon teen phenom", "Dennis Rodman Technicolor hair week", "Dominique Dawes perfect 10 smile", "Bret 'Hitman' Hart entrance swagger", "Rebecca Lobo championship glow", "Penny Hardaway Lil Penny charisma", "Michelle Kwan long program magic"
    ],
    chaosCrushes: [
      "Your Tamagotchi (fully evolved and clingy)", "The AOL Running Man icon", "Slappy the Goosebumps dummy", "Blue Shell from Mario Kart", "Mall Santa with year-round beard", "Auntie Anne's pretzel sample hero", "Your Neopet after a week of neglect", "Blockbuster drop box night shift attendant", "Clippy the Office Assistant in a leather jacket", "1999 Y2K survivalist neighbor", "Dial-up modem voice (romantic version)", "Steve from Blue's Clues thinking chair (sentient)", "Pepe the King Prawn from Muppets Tonight", "Gak monster from the commercial break", "The school PA announcer who says 'Good morning, Eagles!'", "The person who controls the Laser Tag arena lights"
    ]
  },
  coop: {
    dynamicDuos: [
      "Kenan & Kel (shared custody of orange soda)", "Mary-Kate & Ashley Olsen (mystery twins edition)", "Serena & Venus Williams (doubles date)", "Spice Girls duo of your choice", "Cory & Topanga (guidance counselor approved)", "Will & Carlton (Fresh Prince double trouble)", "Buffy & Faith Slayer Squad", "TLC's T-Boz & Left Eye", "Daria & Jane (sarcasm heavy)", "Sailor Uranus & Sailor Neptune power couple", "Joey & Pacey (Dawson's Creek drama pack)", "Cher & Dionne (Clueless bestie bundle)", "Wayne & Garth (party on, crush on)", "Ken & Barbie (Dreamhouse limited edition)", "Clarissa & Sam (ladder access included)", "Mulder & Scully (FBI feelings files)"
    ]
  }
};

const JOBS_LIBRARY = {
  singlePlayer: {
    soloGlowUps: [
      "TRL Revival Host with unlimited wardrobe budget", "Nickelodeon Kids' Choice Slime Showrunner", "Space Jam Warm-Up Choreographer", "Lisa Frank Universe Creative Director", "Blockbuster Comeback CEO", "AOL Homepage Curator-in-Chief", "Nintendo Power Cover Story Boss", "Spice World Tour Storyboard Producer", "MTV Cribs Flex Consultant", "Tamagotchi Whisperer-in-Residence", "Adidas Superstar Sneaker Futurist", "VH1 Pop-Up Video Executive Producer", "All That Sketch Head Writer", "Backstreet Boys Documentary Director", "No Doubt World Tour Stage Designer", "Saved by the Bell Reunion Tour DJ", "Tamagotchi Wellness Retreat Founder", "VH1 Behind the Music Truth Teller"
    ],
    chaosCareers: [
      "Detention Slip Calligrapher", "Lunchroom Mystery Meat Taste Tester", "Portable CD Anti-Skip Inspector", "Furby Night Shift Babysitter", "Y2K Panic Consultant (still on retainer)", "Dial-Up Connection Apology Hotline Rep", "Roller Rink Gum Scraper", "Lisa Frank Glitter Sweeper", "Mall Santa Beard Fluffer", "Soggy Cereal Focus Group Moderator", "Blockbuster Late Fee Debt Collector", "AIM Chatroom Spam Patrol", "Spice Girls Tour Bus Air Freshener Tech", "Arcade Token Jam Unsticker", "Tamagotchi Funeral Planner", "Skip-It Injury Hotline Supervisor", "Mystery Airheads Flavor Developer", "Classroom TV Cart Wrangler"
    ],
    nostalgiaSideQuests: [
      "Scholastic Book Fair Speed Shopper", "Pogs Tournament MC", "Beanie Baby Black Market Broker", "Discovery Zone Birthday Wrangler", "MTV Spring Break Playlist DJ", "Planet Hollywood Memorabilia Curator", "Nick Arcade Beta Tester", "Gap In-Store Playlist Director", "TRL Signboard Graphic Designer", "Pop-Up Roller Disco Founder", "Limited Too Style Scout", "Warped Tour Street Team Captain", "American Girl Doll Repair Specialist", "Disney Afternoon Voiceover Director", "Warheads Sour Face Judge", "KB Toys Midnight Doorbuster Hype Captain", "American Gladiators Spotter", "Sailor Moon Fanclub Newsletter Editor"
    ],
    glitchGigs: [
      "GeoCities Neighborhood Archivist", "Neopets Economy Stabilizer", "Napster Apology Tour Guide", "AIM Away Message Ghostwriter", "Dial-Up Noise Foley Artist", "Virtual Boy Wellness Advocate", "Laser Tag Strategy Streamer", "Game Boy Camera Paparazzi", "Yahoo Chat Room Security Bouncer", "ICQ 'Uh-oh' Sound Curator", "Dreamcast Online Lobby Host", "Flip Phone Fashion Influencer", "Pokemon TCG Holographic Inspector", "Arcade High Score Data Scientist", "VRML Theme Park Architect", "Yahoo! Games Lobby Moderator", "MSN Messenger Nudge Prevention Specialist", "DVD Region Code Hacker for Hire"
    ],
    encoreBossMoves: [
      "Fresh Prince Mansion Event Planner", "Clueless Wardrobe Algorithm Inventor", "Nickelodeon Time Capsule Curator", "Power Rangers Battle Choreographer", "Space Camp Mission Director", "WWF Attitude Era Promo Writer", "Sailor Scouts Earth Liaison", "Mighty Ducks Franchise GM", "Bill Nye Science Roadshow Producer", "Rugrats Reboot Showrunner", "Carmen Sandiego Chief Tracker", "Legends of the Hidden Temple Lore Keeper", "Disney Channel Original Movie Showrunner", "MTV Spring Break Global Architect", "Backstreet Boys Stadium Lighting Designer", "Goosebumps Cinematic Universe Producer", "Toys R Us Comeback Strategist", "Freaks and Geeks Revival Executive Producer"
    ]
  },
  coop: {
    dynamicDuos: [
      "Kenan & Kel Orange Soda Franchise Co-Founder", "Double Dare Obstacle Architects", "Rocket Power Shore Shack Operators", "Legends of the hidden Temple Team Captains", "Sister Sister Swap Club Coordinators", "Spice Girls Reunion Hype Squad", "WB Teen Drama Writers' Room Besties", "Mario & Luigi Retro Repair Start-up", "Goosebumps Haunted Escape Designers", "Animorphs Support Group Counselors", "Babysitters Club Expansion Partners", "Nick Arcade Battle Strategists", "Buffy & Willow Monster Consultancy", "TLC Fan Hotline Hosts", "Lilith Fair Pop-Up Tour Producers", "Figure It Out Panel Judges", "Mystery Files of Shelby Woo Investigators", "Goofy Movie Road Trip Coordinators"
    ]
  }
};

const RIDES_LIBRARY = {
  singlePlayer: {
    soloFlex: [
      "Hot Pink Supra with Trapper Keeper Wrap", "Lisa Frank Neon Hoverboard", "Space Jam Jetpack", "Backstreet Boys Tour Scooter", "Sailor Moon Crescent Motorcycle", "Fresh Prince Convertible with fuzzy dice", "Powerline Stage Dive Zipline", "Nickelodeon Slimeproof BMX", "Tamagotchi Mech Suit", "MTV Cribs Chrome Lowrider", "Legend of Zelda Epona Summon Pass", "X Games Vert Ramp Rocket Board", "Ghostbusters Proton Pack Skates", "Batman Beyond Glide Wings", "Missy Elliott Supa Dupa Fly Inflatable Ride", "Trapper Keeper Jet Ski", "Glamour Shots Convertible", "Kids' Choice Awards Winner's Hover Chair"
    ],
    friendSabotage: [
      "Detention Desk on Rollers", "Shopping Cart with Stuck Wheel", "Heelys with One Wheel Missing", "Teacher's Lounge Overhead Projector Cart", "Mall Fountain Coin Skimmer Paddle Boat", "Roller Rink Rental Skates (two sizes different)", "Furby-Powered Segway", "Dial-Up Modem Drone (buffering forever)", "Pogs Slammer Catapult (no brakes)", "Slime-Covered Slip'N'Slide Commuter", "Mini ATV with Spice Girls Horn stuck on loop", "Floppy Disk Frisbee Hovercraft", "AOL Free Trial CD Skimboard", "Y2K Panic Bunker Wheelbarrow", "Sock'em Bopper Rocket Sled", "School Chair Scooter with squeaky wheel", "TV Cart with strapped-in VCR", "Detention Hall Floor Buffer Ride-Along"
    ],
    nostalgiaCruisers: [
      "Blockbuster Drop Box Courier Wagon", "Nickelodeon Gak Delivery Truck", "Limited Too Glitter Hatchback", "Abercrombie Mall Radio Shuttle", "Hot Topic Smoke Machine Van", "Suncoast Video VHS Shuttle", "Sam Goody Listening Lounge Bus", "Discovery Zone Birthday Parade Float", "KB Toys Midnight Restock Forklift", "Claire's Piercing Party Limousine", "Sharper Image Massage Chair Hoverpod", "WB Frog Parade Convertible", "Spencer's Blacklight Cruiser", "Planet Hollywood Memorabilia Pickup", "ESPN Zone Courtside Shuttle", "Tower Records Listening Booth Truck", "Disney Store Animatronic Parade Car", "Limited Too x Delia's Fashion Caravan"
    ],
    snackMobiles: [
      "Pizza Hut Stuffed Crust Delivery Drone", "Capri Sun Silver Pouch Hovercraft", "Dunkaroos Frosting Tank", "Gushers Splash Wagon", "Surge Soda Rally Car", "Lunchables Assembly Line Van", "Warheads Sour Blimp", "Pop Rocks Rocket Bike", "Fruit by the Foot Ribbon Glider", "Push Pop Convertible", "Kool-Aid Man Splashmobile", "Otter Pop Sidecar Motorcycle", "Cinnamon Toast Crunch Cereal Bowl Boat", "Jell-O Pudding Slide", "Ring Pop Diamond Carriage", "Bagel Bites Midnight Snack Shuttle", "Easy-Bake Oven Dessert Truck", "Squeeze-It Bottle Jet Pack"
    ],
    scrappyRollers: [
      "Dad's '87 Wood Paneled Minivan", "Carpool Saturn SL2 with mixtape stuck", "Geo Metro with flame decals", "Rollerblade-Bike Hybrid From Sharper Image", "BMX with cards clipped to wheels", "Razor Scooter with neon spokes", "Power Wheels Jeep Overclocked", "Skateboard with duct-taped boom box", "Foldable Micro Scooter with disco ball", "Borrowed Honda Civic Hatchback", "Convertible Couch on Skateboard Wheels", "Zebra Print Schwinn Cruiser", "Trash Can Luge", "Radio Flyer Wagon pulled by cousins", "Sonic the Hedgehog Soap Shoes", "Moon Shoes Cross-Country Rig", "Garage Sale Rollerblades (sparks included)", "Cardboard Box Derby Racer"
    ]
  },
  coop: {
    tagTeamTransports: [
      "Double Dare Slimeproof Tandem Bike", "Mario Kart Sidecar with Blue Shell Launcher", "Kenan & Kel Orange Soda Delivery Van", "Power Rangers Megazord Joyride", "Scooby-Doo Mystery Machine Karaoke Ride", "Rocket Power Tandem Longboard", "Pokemon Stadium Team Bus", "Animorphs Flock Glider", "Legends of the Hidden Temple River Raft", "Spice Girls Tour Bus Friendship Express", "Goosebumps Haunted Roller Coaster Car", "Sister Sister Convertible with dual steering wheels", "TRL Pop-Up Stage Truck", "Bop It Syncro Sidecar Scooter", "WWF Tag Team Entrance Ramp Cart", "Sailor Scouts Moon Cycle Caravan", "Mystery Science Theater 3000 Satellite Car", "Rugrats Reptar Wagon Deluxe"
    ]
  }
};

const SALARY_LIBRARY = {
  singlePlayer: {
    ballerStatus: [
      "$999,999 plus a lifetime supply of Gushers",
      "$777,777 plus a personal chef who only makes Lunchables",
      "Royalties from the 'Cha-Cha Slide'",
      "Equity in a revitalized Blockbuster Video franchise"
    ],
    doinAlright: [
      "$250,000 and a fully-stocked walk-in closet from Contempo Casuals",
      "$185,000 plus a bonus paid in Pogs",
      "$150,000 and a reserved parking spot at the Mall of America",
      "NostalgiaPerks: unlimited access to the MTV Spring Break archives"
    ],
    stylinOnBudget: [
      "$95,000 and free popcorn at Suncoast Video for life",
      "$76,000 plus all the free AOL trial CDs you can carry",
      "$52,000 and you get to keep the giant pencil from the Scholastic Book Fair",
      "A salary paid entirely in Beanie Babies (market value pending)"
    ],
    survivingOnGrit: [
      "$12,345 plus a broken Talkboy recorder",
      "An allowance from your parents (and you have to do chores)",
      "A lifetime supply of breadsticks from Pizza Hut",
      "Forgiveness of all your Blockbuster late fees"
    ]
  },
  coop: {
    duoDeals: [
      "$600,000 shared Kenan & Kel Orange Soda royalties",
      "$480,000 split as Double Dare hosts",
      "$300,000 shared Pokemon League coaching retainer",
      "$260,000 co-managing Rocket Power shore shack",
      "$222,000 plus TRL fan club empire",
      "$200,000 plus matching Spice World wardrobe stipends"
    ]
  }
};

export const SALARY_TIERS = [
  { 
    tier: "Baller Status 🤑", 
    keywords: ["$999,999", "$777,777", "$600,000", "$500,000", "$480,000", "royalties", "equity", "franchise income", "poweruproyalties"] 
  },
  { 
    tier: "Doin' Alright 😎", 
    keywords: ["$420,000", "$365,000", "$300,000", "$260,000", "$250,000", "$222,000", "$200,000", "$185,000", "$160,000", "$150,000", "nostalgiaperks"] 
  },
  { 
    tier: "Stylin' on a Budget 🤙", 
    keywords: ["$130,000", "$120,000", "$100,000", "$95,000", "$90,000", "$88,888", "$76,000", "$75,000", "$65,000", "$60,000", "$58,000", "$54,000", "$52,000", "$50,000", "$48,000", "$44,444", "$40,000"] 
  },
  { 
    tier: "Surviving on Gushers & Grit 💥", 
    keywords: ["$32,000", "$28,500", "$24,000", "$19,990", "$17,760", "$14,000", "$12,345", "$9,001", "$6,500", "$4,444", "$3,210", "$2,525", "$1,969", "$1,111", "$500", "$333", "$257", "$111", "token", "allowance", "no pay", "clout", "free trial", "gift card", "passes", "forgiveness", "breadsticks", "chaoscomp", "friendsabotage"]
  }
];

export const ALL_CATEGORIES: { [key: string]: any } = {
  Spouse: SPOUSE_LIBRARY,
  Job: JOBS_LIBRARY,
  Ride: RIDES_LIBRARY,
  Salary: SALARY_LIBRARY,
  Kids: {
      singlePlayer: {
        "Your Progeny": [
          "0 kids, just a pet rock", "2 kids, a boy and a girl", "4 kids, all with bowl cuts", "101 dalmatians"
        ]
      },
      coop: {
        "Your Crew": [
          "The entire Rugrats crew", "A Tamagotchi for each of you", "A litter of Furby babies", "The Animaniacs (Yakko, Wakko, and Dot)"
        ]
      }
  },
  Housing: [
    "Mansion", "Apartment", "Shack", "House"
  ]
};

export const STORY_MODES = [
  // Self Modes
  { id: 'mode01', title: 'Me, Myself & MASH', description: "A classic first-person story. It's all about YOU.", emoji: '😎' },
  { id: 'mode02', title: 'Future Me Diary', description: "A secret diary entry written by your future self.", emoji: '📓' },
  { id: 'mode03', title: 'Influencer POV', description: "'What's up guys!' Your future life, as a social media vlog.", emoji: '🤳' },
  { id: 'mode04', title: 'Streetwear CEO', description: 'Your life as a profile in a super-exclusive hypebeast mag.', emoji: '👟' },
  { id: 'mode17', title: 'Action Figure Bio', description: 'The bio written on the back of your own action figure box.', emoji: '💥' },
  { id: 'mode18', title: 'Haiku', description: 'Your entire future... told in exactly seventeen syllables.', emoji: '📜' },
  
  // Friend (Nice) Modes
  { id: 'mode06', title: 'Movie Trailer Voice', description: "'In a world...' Their MASH results, as a blockbuster movie trailer.", emoji: '🎬' },
  { id: 'mode12', title: 'Game Show Host', description: "'Come on down!' A hyped-up game show announcer reveals their prizes.", emoji: '🤑' },
  { id: 'mode07', title: 'News Flash', description: 'A breaking news report about their totally awesome future.', emoji: '📺' },
  { id: 'mode23', title: 'Bestie Hype Speech', description: "A super enthusiastic speech about how awesome your friend's future is.", emoji: '🎉' },
  { id: 'mode29', title: 'Yearbook Superlative', description: "'Most likely to succeed...' A prediction from their future yearbook.", emoji: '🏆' },
  { id: 'mode19', title: 'Recipe Card', description: "The step-by-step recipe for cooking up their amazing future life.", emoji: '🍳' },
  
  // Friend (Naughty) Modes
  { id: 'mode05', title: 'Paparazzi Report', description: 'A scandalous tabloid-style recap of their future life.', emoji: '📸' },
  { id: 'mode10', title: 'Bestie Roast', description: 'Their future, as lovingly roasted by you, their sarcastic best friend.', emoji: '😂' },
  { id: 'mode08', title: 'Alien Documentary', description: 'Their life, as studied and narrated by confused aliens.', emoji: '👽' },
  { id: 'mode24', title: "'Intervention' Letter", description: "A dramatic, funny letter from a 'concerned friend' about their chaotic future.", emoji: '💌' },
  { id: 'mode27', title: "Frenemy's Gossip Column", description: "A delightfully catty gossip column entry about their MASH fortune.", emoji: '💅' },
  { id: 'mode30', title: 'Public Apology Script', description: "The script for their future public apology video for a hilarious mishap.", emoji: '🙏' },

  // Co-op Modes
  { id: 'mode09', title: 'Pop Star Interview', description: "Your future, revealed in a 'TRL' style interview with the both of you.", emoji: '🎤' },
  { id: 'mode13', title: 'Podcast Interview', description: 'A deep-dive interview on a popular podcast about your life together.', emoji: '🎙️' },
  { id: 'mode20', title: 'Sitcom Cold Open', description: "The chaotic opening scene of a 90s sitcom about your life together.", emoji: '😂' },
  { id: 'mode25', title: 'Reality TV Intro', description: "The dramatic intro sequence for your new reality show, 'MASHin' It Work'.", emoji: '🎥' },
  { id: 'mode26', title: 'Wedding Toast', description: "A funny and heartwarming wedding toast celebrating your MASH-approved union.", emoji: '🥂' },
  { id: 'mode28', title: 'Couples Therapy', description: "A hilarious transcript from a therapy session about your MASH future.", emoji: '🛋️' },
  { id: 'mode31', title: 'Business Press Release', description: "An official press release announcing your powerful new business partnership.", emoji: '📈' },

  // Unused from original list for now, can be re-added
  // { id: 'mode11', title: 'TikTok Trend', description: "A viral TikTok that shows off your future glow-up.", emoji: '💃' },
  // { id: 'mode14', title: 'Courtroom Drama', description: 'A lawyer dramatically presents the evidence of your future.', emoji: '⚖️' },
  // { id: 'mode15', title: 'Hot Takes Panel', description: 'Sports-style commentators argue about your MASH results.', emoji: '🌶️' },
  // { id: 'mode16', title: 'Goth Poetry', description: 'A dark, brooding, and overly dramatic poem about your fate.', emoji: '🥀' },
  // { id: 'mode21', title: 'Ringtone Ad', description: 'A cheesy TV ad trying to sell a ringtone about your life.', emoji: '🎶' },
  // { id: 'mode22', title: 'AIM Away Message', description: 'Your future, summarized in a series of cryptic AIM away messages.', emoji: '💻' }
];

export const GAME_MODE_STORY_FILTER = {
  self: ['mode01', 'mode02', 'mode03', 'mode04', 'mode17', 'mode18'],
  friend: {
    nice: ['mode23', 'mode29', 'mode06', 'mode12', 'mode07', 'mode19'],
    naughty: ['mode10', 'mode05', 'mode27', 'mode24', 'mode30', 'mode08']
  },
  coop: ['mode25', 'mode28', 'mode20', 'mode26', 'mode31', 'mode13', 'mode09']
};