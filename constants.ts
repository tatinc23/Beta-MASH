import { LibraryCategory, StoryMode, SharePlatform, CategoryConfig } from "./types";

export const CATEGORY_INFO: { [key: string]: { name: string; icon: string } } = {
  // Original
  Housing: { name: 'Housing', icon: '🏠' },
  Spouse: { name: 'Spouse', icon: '💖' },
  Job: { name: 'Job', icon: '💼' },
  Car: { name: 'Car', icon: '🚗' },
  Kids: { name: 'Number of Kids', icon: '👶' },
  Pet: { name: 'Pet', icon: '🐾' },
  City: { name: 'City', icon: '🏙️' },
  Wealth: { name: 'Wealth', icon: '💰' },
  // Besties
  'Shared Housing': { name: 'Shared Housing', icon: '🏠' },
  'Dynamic Duo Name': { name: 'Duo Name', icon: '🦸' },
  'Shared Pet': { name: 'Shared Pet', icon: '🐾' },
  'Go-To Hangout City': { name: 'Hangout City', icon: '🏙️' },
  'Dream Car': { name: 'Dream Car', icon: '🚗' },
  'Shared Hobby': { name: 'Shared Hobby', icon: '🎨' },
  'Shared Wealth': { name: 'Shared Wealth', icon: '💰' },
  'Biggest Rival': { name: 'Biggest Rival', icon: '💥' },
  // Siblings
  'Family Housing Situation': { name: 'Housing Situation', icon: '👨‍👩‍👧‍👦' },
  'Family Car & Keys': { name: 'Family Car', icon: '🔑' },
  'Chore You Forever Argue About': { name: 'Chore Argument', icon: '🧹' },
  'Sibling Showdown': { name: 'Sibling Showdown', icon: '🥊' },
  'Holiday Tradition': { name: 'Holiday Tradition', icon: '🎄' },
  'Prank War Signature Move': { name: 'Prank Move', icon: '😈' },
  'Inheritance/Windfall Outcome': { name: 'Inheritance', icon: '💸' },
  'Family Pet': { name: 'Family Pet', icon: '🐶' },
  // Dating
  'First Apartment Vibe': { name: 'Apartment Vibe', icon: '🛋️' },
  'Two-Career Combo': { name: 'Career Combo', icon: '💼' },
  'Date Night Ride': { name: 'Date Ride', icon: '🚲' },
  'Meet-Cute Origin': { name: 'Meet-Cute', icon: '🥰' },
  'Couple Aesthetic': { name: 'Couple Aesthetic', icon: '💅' },
  'Pet Together': { name: 'Pet Together', icon: '🐕' },
  "City You'll Try": { name: 'City You\'ll Try', icon: '✈️' },
  'Money Energy': { name: 'Money Energy', icon: '🤑' },
  // Crush
  'Meet-Cute Scenario': { name: 'Meet-Cute', icon: '💘' },
  'Imagined Dual Jobs': { name: 'Dual Jobs', icon: '🧑‍🔬' },
  'Texting Style': { name: 'Texting Style', icon: '📱' },
  'First Disaster Date': { name: 'Disaster Date', icon: '😬' },
  'Concert You Pretend to Like': { name: 'Concert', icon: '🎤' },
  'Dream Housing Flex': { name: 'Housing Flex', icon: '🏰' },
  'Future Pet': { name: 'Future Pet', icon: '🐢' },
  'Where You Bump Into Them Again': { name: 'Bump Into Them', icon: '👀' },
  // Exes
  'Post-Breakup Housing': { name: 'Post-Breakup Housing', icon: '📦' },
  'Parallel Careers': { name: 'Parallel Careers', icon: '🎭' },
  'Co-Parenting Pet or Plant': { name: 'Co-Parenting', icon: '🌱' },
  'Reason It Ended': { name: 'Reason It Ended', icon: '💔' },
  'Who Gets the Ride': { name: 'Who Gets the Ride', icon: '🛵' },
  'Rebound City': { name: 'Rebound City', icon: '🏝️' },
  'Playlist Division': { name: 'Playlist Division', icon: '🎧' },
  'Petty Flex': { name: 'Petty Flex', icon: '💪' },
  // Married
  'Home Base': { name: 'Home Base', icon: '🏡' },
  'Career Combo': { name: 'Career Combo', icon: '🧑‍⚕️' },
  'Family Vehicle': { name: 'Family Vehicle', icon: '🚐' },
  'Weekend Ritual': { name: 'Weekend Ritual', icon: '🥞' },
  'Where You Settle': { name: 'Where You Settle', icon: '📍' },
  'Money Plotline': { name: 'Money Plotline', icon: '📈' },
  'Household Quirk': { name: 'Household Quirk', icon: '🤪' }
};

export const DEFAULT_CATEGORIES: CategoryConfig[] = [
    { key: 'Housing', name: 'Housing', icon: '🏠', isCustom: false, isSelected: true },
    { key: 'Spouse', name: 'Spouse', icon: '💖', isCustom: false, isSelected: true },
    { key: 'Job', name: 'Job', icon: '💼', isCustom: false, isSelected: true },
    { key: 'Car', name: 'Car', icon: '🚗', isCustom: false, isSelected: true },
    { key: 'Kids', name: 'Number of Kids', icon: '👶', isCustom: false, isSelected: true },
    { key: 'Pet', name: 'Pet', icon: '🐾', isCustom: false, isSelected: true },
    { key: 'City', name: 'City', icon: '🏙️', isCustom: false, isSelected: true },
    { key: 'Wealth', name: 'Wealth', icon: '💰', isCustom: false, isSelected: true },
];

// Libraries of options for categories
export const ALL_CATEGORIES: { [key: string]: string[] | { singlePlayer: LibraryCategory, coop: LibraryCategory } } = {
  Housing: ["Mansion", "Apartment", "Shack", "House"],
  Spouse: {
    singlePlayer: {
      '90s Heartthrobs': {
        'Actors': ['Leonardo DiCaprio', 'Jonathan Taylor Thomas', 'Mark Wahlberg', 'Freddie Prinze Jr.', 'Will Smith', 'Keanu Reeves', 'Brad Pitt', 'Devon Sawa'],
        'Musicians': ['Justin Timberlake', 'Nick Carter', 'Usher', 'Jordan Knight', 'Mark McGrath', 'Gavin Rossdale'],
      },
      '90s Queens': {
        'Actresses': ['Jennifer Aniston', 'Tiffani Thiessen', 'Alicia Silverstone', 'Sarah Michelle Gellar', 'Jennifer Love Hewitt', 'Drew Barrymore', 'Cameron Diaz', 'Liv Tyler'],
        'Musicians': ['Britney Spears', 'Christina Aguilera', 'Mandy Moore', 'Jessica Simpson', 'Gwen Stefani', 'Aaliyah', 'Mariah Carey', 'Janet Jackson'],
      },
      'Movie Characters': ['Jack Dawson (Titanic)', 'Cher Horowitz (Clueless)', 'Forrest Gump', 'Kat Stratford (10 Things I Hate About You)', 'Neo (The Matrix)', 'Rose DeWitt Bukater (Titanic)'],
    },
    coop: {
      'Power Couples': ['Kurt Cobain & Courtney Love', 'Will Smith & Jada Pinkett', 'David & Victoria Beckham', 'Tom Cruise & Nicole Kidman', 'Brad Pitt & Jennifer Aniston', 'Gavin Rossdale & Gwen Stefani'],
      'Animated Duos': ['Mickey & Minnie Mouse', 'Homer & Marge Simpson', 'Roger & Jessica Rabbit', 'Gomez & Morticia Addams', 'Aladdin & Jasmine', 'Beauty & the Beast'],
      'Fictional Pairs': ['Ross & Rachel (Friends)', 'Corey & Topanga (Boy Meets World)', 'Xena & Gabrielle', 'Mulder & Scully (X-Files)', 'Zack & Kelly (Saved by the Bell)'],
      'Sabotage Spouse': ['A Furby', 'Your Tamagotchi', 'A dial-up modem', 'The AOL "You\'ve Got Mail" guy', 'Barney the Dinosaur', 'A Beanie Baby'],
    }
  },
  Job: {
    singlePlayer: {
      'Dream Jobs': ['Video Game Tester', 'Astronaut', 'Movie Star', 'Musician', 'MTV VJ', 'Fashion Designer'],
      'Corporate Gigs': ['Dot-com CEO', 'Stock Broker', 'Marketing Exec', 'Web Designer', 'Day Trader', 'Systems Analyst'],
      '90s Classics': ['Blockbuster Employee', 'Mall food court worker', 'Beanie Baby authenticator', 'Rollerblade messenger', 'CD store clerk'],
    },
    coop: {
      'Creative Careers': ['Toy Inventor (for Beanie Babies)', 'Animator for Disney', 'Sitcom Writer', 'Magazine Editor (for Tiger Beat)'],
      'Practical Paths': ['Doctor', 'Lawyer', 'Teacher', 'Accountant', 'Architect', 'Veterinarian'],
      'Sabotage Jobs': ['Professional Pager salesman', 'Dial-up Internet support tech', 'Filling up ketchup bottles at a diner', 'Mascot for a failed dot-com bubble company'],
    }
  },
  Car: {
    singlePlayer: {
      'Dream Cars': ['Lamborghini Diablo', 'Ferrari F50', 'Dodge Viper', 'Acura NSX', 'Porsche 911', 'McLaren F1'],
      'Sensible Rides': ['Honda Civic', 'Ford Explorer', 'Jeep Cherokee', 'Toyota Camry', 'Subaru Outback', 'Nissan Maxima'],
      '90s Icons': ['Mazda Miata', 'Jeep Wrangler (with Jurassic Park deco)', 'Ford Mustang Convertible', 'A Geo Metro', 'Hummer H1', 'VW Jetta'],
    },
    coop: {
      'Cool Rides': ['DeLorean (for time travel)', 'The Batmobile (from Batman Forever)', 'A custom Lowrider', 'Oscar Mayer Wienermobile', 'The Flintstones car'],
      'Family Vans': ['Chrysler Town & Country', 'Ford Windstar', 'Dodge Caravan', 'A station wagon with wood paneling', 'Chevy Astro Van'],
      'Sabotage Cars': ['A unicycle', 'A shopping cart', 'A Big Wheel tricycle', 'A pogo stick', 'Heelys (the shoes with wheels)', 'A Razor scooter'],
    }
  },
  Kids: {
    singlePlayer: { 'Numbers': ['0', '1', '2', '3', '4', 'A whole basketball team'], },
    coop: { 'Numbers': ['0', '1', '2', 'Twins!', 'Triplets!', 'Enough for a family band like Hanson'], }
  },
  Pet: {
    singlePlayer: {
      'Classic Pets': ['Golden Retriever', 'A fluffy cat', 'Parakeet', 'Goldfish', 'A hamster', 'A turtle'],
      '90s Crazes': ['Tamagotchi', 'Furby', 'Giga Pet', 'A chia pet', 'Sea-Monkeys', 'Pogs (as pets?)'],
      'Exotic': ['A monkey (like Marcel from Friends)', 'A cool Iguana', 'A Pot-bellied pig', 'An ant farm', 'A ferret', 'A snake'],
    },
    coop: {
      'Digital Companions': ['An army of Tamagotchis', 'A talking Furby that never sleeps', 'A Pokedex', 'A Digimon', 'Nintendogs (a bit early, but hey)'],
      'Unusual Friends': ['A pet rock with googly eyes', 'A Slinky', 'A Magic 8-Ball', 'Your little sibling', 'A troll doll'],
      'Sabotage Pet': ['A gremlin (don\'t feed after midnight)', 'A velociraptor from Jurassic Park', 'The dust bunnies under your bed', 'A Tickle Me Elmo that won\'t stop laughing'],
    }
  },
  City: {
    singlePlayer: {
      'USA': ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Seattle, WA', 'Miami, FL', 'Austin, TX'],
      'International': ['London, UK', 'Tokyo, Japan', 'Paris, France', 'Sydney, Australia', 'Rome, Italy', 'Rio de Janeiro, Brazil'],
      'Fictional': ['Hill Valley (Back to the Future)', 'Sunnydale (Buffy)', 'Emerald City (Oz)', 'Gotham City', 'Hogwarts', 'Springfield (The Simpsons)'],
    },
    coop: {
      'Vibrant Hubs': ['New Orleans, LA', 'San Francisco, CA', 'Las Vegas, NV', 'Nashville, TN', 'Portland, OR'],
      'Chill Spots': ['A beach town in Hawaii', 'A cabin in Montana', 'A quiet village in Italy', 'On a houseboat in Seattle', 'A vineyard in Napa Valley'],
      'Sabotage City': ['Inside a giant pinball machine', 'The set of the Teletubbies', 'AOL chatroom #27', 'Your old high school cafeteria'],
    }
  },
   Wealth: {
    singlePlayer: {
        '90s Fortunes': ['Dot-com bubble millionaire', 'Making bank from Beanie Babies', 'Living off that Fresh Prince money', 'Won the Nickelodeon Super Toy Run', 'Casually rich like the Friends cast'],
        'Modern Money': ['Crypto millionaire', 'Creator of a viral dance challenge', 'Cashed out on a meme stock', 'Sold an NFT for a fortune', 'Has a subscription box for everything'],
    },
    coop: {
      'Power Fortunes': ['Dot-com bubble power couple', 'Invented the Macarena and retired', 'Started a boy band, now loaded', 'Sold a screenplay for a blockbuster movie', 'Franchised a chain of coffee shops'],
      'Sabotage Wealth': ['Swimming in student loan debt', 'Owns a Blockbuster store in 2025', 'Has a collection of Pogs (they\'re worthless)', 'Pays for everything in AOL free trial CDs', 'Invested everything in a failed crypto coin'],
    }
  },
};

export const STORY_MODES: StoryMode[] = [
  { id: 'sassy', title: 'Sassy', description: 'A fun and sassy take on your future.', emoji: '😏' },
  { id: 'wholesome', title: 'Wholesome', description: 'A sweet and happy-go-lucky story.', emoji: '💖' },
  { id: 'roasty', title: 'Roasty', description: 'A hilarious roast of your MASH results.', emoji: '🔥' },
];

export const SHARE_PLATFORMS: SharePlatform[] = [
  { name: 'X', emoji: '👁️', url: 'https://twitter.com/intent/tweet?text=' },
  { name: 'TikTok', emoji: '🎵', url: 'https://www.tiktok.com/' }, // Note: TikTok doesn't have a direct share URL with text
  { name: 'Facebook', emoji: '👍', url: 'https://www.facebook.com/sharer/sharer.php?u=' },
  { name: 'Copy Link', emoji: '🔗', url: '', action: 'copy' },
  { name: 'Save', emoji: '💾', url: '', action: 'download' },
];

export const SPONSOR = { tag: '@tat_inc', prize: '$50 Amazon Gift Card' };