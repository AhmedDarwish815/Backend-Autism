import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding Learning Items...");

    // ==========================================
    // PEOPLE
    // ==========================================
    await prisma.learningItem.createMany({
        data: [
            { category: "PEOPLE", title: "Mother", imageUrl: "/images/people/mother.png", phrases: ["This is my mother.", "I love my mother.", "My mother is kind."], sortOrder: 1 },
            { category: "PEOPLE", title: "Father", imageUrl: "/images/people/father.png", phrases: ["This is my father.", "My father is strong.", "I love my father."], sortOrder: 2 },
            { category: "PEOPLE", title: "Sister", imageUrl: "/images/people/sister.png", phrases: ["This is my sister.", "My sister is funny.", "I play with my sister."], sortOrder: 3 },
            { category: "PEOPLE", title: "Brother", imageUrl: "/images/people/brother.png", phrases: ["This is my brother.", "My brother is tall.", "I like my brother."], sortOrder: 4 },
            { category: "PEOPLE", title: "Family", imageUrl: "/images/people/family.png", phrases: ["This is my family.", "I love my family.", "My family is happy."], sortOrder: 5 },
            { category: "PEOPLE", title: "Grandparents", imageUrl: "/images/people/grandparents.png", phrases: ["These are my grandparents.", "I visit my grandparents.", "My grandparents are kind."], sortOrder: 6 },
            { category: "PEOPLE", title: "Aunt", imageUrl: "/images/people/aunt.png", phrases: ["This is my aunt.", "My aunt is nice."], sortOrder: 7 },
            { category: "PEOPLE", title: "Uncle", imageUrl: "/images/people/uncle.png", phrases: ["This is my uncle.", "My uncle is funny."], sortOrder: 8 },
        ],
        skipDuplicates: true,
    });

    // ==========================================
    // SCHOOL
    // ==========================================
    await prisma.learningItem.createMany({
        data: [
            { category: "SCHOOL", title: "Board", imageUrl: "/images/school/board.png", phrases: ["This is a board.", "The teacher writes on the board.", "I look at the board."], sortOrder: 1 },
            { category: "SCHOOL", title: "Teacher", imageUrl: "/images/school/teacher.png", phrases: ["My teacher is here.", "Who's your teacher?", "Help me, teacher.", "Call the teacher, please."], sortOrder: 2 },
            { category: "SCHOOL", title: "Pencil", imageUrl: "/images/school/pencil.png", phrases: ["This is a pencil.", "I write with a pencil.", "Give me the pencil."], sortOrder: 3 },
            { category: "SCHOOL", title: "Book", imageUrl: "/images/school/book.png", phrases: ["This is a book.", "I read a book.", "Open your book."], sortOrder: 4 },
            { category: "SCHOOL", title: "Classroom", imageUrl: "/images/school/classroom.png", phrases: ["This is a classroom.", "I sit in the classroom.", "My classroom is big."], sortOrder: 5 },
            { category: "SCHOOL", title: "Desk", imageUrl: "/images/school/desk.png", phrases: ["This is a desk.", "I sit at my desk.", "Put it on the desk."], sortOrder: 6 },
            { category: "SCHOOL", title: "Chair", imageUrl: "/images/school/chair.png", phrases: ["This is a chair.", "Sit on the chair.", "My chair is comfortable."], sortOrder: 7 },
            { category: "SCHOOL", title: "Courtyard", imageUrl: "/images/school/courtyard.png", phrases: ["This is the courtyard.", "I play in the courtyard.", "The courtyard is big."], sortOrder: 8 },
        ],
        skipDuplicates: true,
    });

    // ==========================================
    // ANIMALS
    // ==========================================
    await prisma.learningItem.createMany({
        data: [
            { category: "ANIMALS", title: "Dog", imageUrl: "/images/animals/dog.png", phrases: ["This is a dog.", "The dog is friendly.", "I like dogs."], sortOrder: 1 },
            { category: "ANIMALS", title: "Cat", imageUrl: "/images/animals/cat.png", phrases: ["This is a cat.", "The cat is cute.", "I love cats."], sortOrder: 2 },
            { category: "ANIMALS", title: "Rabbit", imageUrl: "/images/animals/rabbit.png", phrases: ["This is a rabbit.", "The rabbit is white.", "The rabbit can jump."], sortOrder: 3 },
            { category: "ANIMALS", title: "Bird", imageUrl: "/images/animals/bird.png", phrases: ["This is my bird.", "Is this a bird?", "My bird can fly.", "My bird is cute."], sortOrder: 4 },
            { category: "ANIMALS", title: "Turtle", imageUrl: "/images/animals/turtle.png", phrases: ["This is a turtle.", "The turtle is slow.", "I like turtles."], sortOrder: 5 },
            { category: "ANIMALS", title: "Mouse", imageUrl: "/images/animals/mouse.png", phrases: ["This is a mouse.", "The mouse is small.", "The mouse is fast."], sortOrder: 6 },
            { category: "ANIMALS", title: "Sheep", imageUrl: "/images/animals/sheep.png", phrases: ["This is a sheep.", "The sheep is white.", "The sheep says baa."], sortOrder: 7 },
            { category: "ANIMALS", title: "Horse", imageUrl: "/images/animals/horse.png", phrases: ["This is a horse.", "The horse is fast.", "I like horses."], sortOrder: 8 },
        ],
        skipDuplicates: true,
    });

    // ==========================================
    // COLORS
    // ==========================================
    await prisma.learningItem.createMany({
        data: [
            { category: "COLORS", title: "Black", imageUrl: "/images/colors/black.png", phrases: ["This is black.", "The color is black.", "I see black."], sortOrder: 1 },
            { category: "COLORS", title: "White", imageUrl: "/images/colors/white.png", phrases: ["This is white.", "The color is white.", "I see white."], sortOrder: 2 },
            { category: "COLORS", title: "Red", imageUrl: "/images/colors/red.png", phrases: ["This is red.", "The color is red.", "I like red."], sortOrder: 3 },
            { category: "COLORS", title: "Blue", imageUrl: "/images/colors/blue.png", phrases: ["This is blue.", "The color is blue.", "I like blue."], sortOrder: 4 },
            { category: "COLORS", title: "Yellow", imageUrl: "/images/colors/yellow.png", phrases: ["This is yellow.", "The color is yellow.", "I like yellow."], sortOrder: 5 },
            { category: "COLORS", title: "Green", imageUrl: "/images/colors/green.png", phrases: ["This is green.", "The color is green.", "I like green."], sortOrder: 6 },
            { category: "COLORS", title: "Brown", imageUrl: "/images/colors/brown.png", phrases: ["This is brown.", "The color is brown."], sortOrder: 7 },
            { category: "COLORS", title: "Pink", imageUrl: "/images/colors/pink.png", phrases: ["This is pink.", "The color is pink.", "I like pink."], sortOrder: 8 },
            { category: "COLORS", title: "Purple", imageUrl: "/images/colors/purple.png", phrases: ["This is purple.", "The color is purple."], sortOrder: 9 },
            { category: "COLORS", title: "Orange", imageUrl: "/images/colors/orange.png", phrases: ["This is orange.", "The color is orange.", "I like orange."], sortOrder: 10 },
        ],
        skipDuplicates: true,
    });

    // ==========================================
    // NUMBERS
    // ==========================================
    await prisma.learningItem.createMany({
        data: Array.from({ length: 10 }, (_, i) => ({
            category: "NUMBERS" as const,
            title: `${i + 1}`,
            imageUrl: `/images/numbers/${i + 1}.png`,
            phrases: [`This is number ${i + 1}.`, `Count to ${i + 1}.`, `I can count ${i + 1}.`],
            sortOrder: i + 1,
        })),
        skipDuplicates: true,
    });

    // ==========================================
    // ARABIC ALPHABET
    // ==========================================
    const arabicLetters = [
        { letter: "أ", word: "أسد",    wordEn: "Lion" },
        { letter: "ب", word: "بطة",    wordEn: "Duck" },
        { letter: "ت", word: "تفاحة",  wordEn: "Apple" },
        { letter: "ث", word: "ثعلب",   wordEn: "Fox" },
        { letter: "ج", word: "جمل",    wordEn: "Camel" },
        { letter: "ح", word: "حصان",   wordEn: "Horse" },
        { letter: "خ", word: "خروف",   wordEn: "Sheep" },
        { letter: "د", word: "دجاجة",  wordEn: "Chicken" },
        { letter: "ذ", word: "ذئب",    wordEn: "Wolf" },
        { letter: "ر", word: "رمانة",  wordEn: "Pomegranate" },
        { letter: "ز", word: "زهرة",   wordEn: "Flower" },
        { letter: "س", word: "سمكة",   wordEn: "Fish" },
        { letter: "ش", word: "شمس",    wordEn: "Sun" },
        { letter: "ص", word: "صقر",    wordEn: "Falcon" },
        { letter: "ض", word: "ضفدع",   wordEn: "Frog" },
        { letter: "ط", word: "طائر",   wordEn: "Bird" },
        { letter: "ظ", word: "ظبي",    wordEn: "Deer" },
        { letter: "ع", word: "عصفور",  wordEn: "Sparrow" },
        { letter: "غ", word: "غزال",   wordEn: "Gazelle" },
        { letter: "ف", word: "فراشة",  wordEn: "Butterfly" },
        { letter: "ق", word: "قطة",    wordEn: "Cat" },
        { letter: "ك", word: "كلب",    wordEn: "Dog" },
        { letter: "ل", word: "ليمون",  wordEn: "Lemon" },
        { letter: "م", word: "موز",    wordEn: "Banana" },
        { letter: "ن", word: "نملة",   wordEn: "Ant" },
        { letter: "هـ", word: "هرة",   wordEn: "Cat" },
        { letter: "و", word: "وردة",   wordEn: "Rose" },
        { letter: "ي", word: "يد",     wordEn: "Hand" },
    ];

    await prisma.learningItem.createMany({
        data: arabicLetters.map((l, i) => ({
            category: "ARABIC_ALPHABET" as const,
            title: l.letter,
            imageUrl: `/images/arabic/${i + 1}.png`,
            phrases: [
                `${l.letter} لـ ${l.word}`,
                `هذا حرف ${l.letter}`,
                `${l.word} تبدأ بحرف ${l.letter}`,
            ],
            sortOrder: i + 1,
        })),
        skipDuplicates: true,
    });

    // ==========================================
    // ENGLISH ALPHABET
    // ==========================================
    const englishLetters = [
        { letter: "A", word: "Apple" },    { letter: "B", word: "Ball" },
        { letter: "C", word: "Carrot" },   { letter: "D", word: "Dog" },
        { letter: "E", word: "Elephant" }, { letter: "F", word: "Fish" },
        { letter: "G", word: "Grapes" },   { letter: "H", word: "Hat" },
        { letter: "I", word: "Ice cream" },{ letter: "J", word: "Juice" },
        { letter: "K", word: "Kite" },     { letter: "L", word: "Lion" },
        { letter: "M", word: "Moon" },     { letter: "N", word: "Nest" },
        { letter: "O", word: "Orange" },   { letter: "P", word: "Pencil" },
        { letter: "Q", word: "Queen" },    { letter: "R", word: "Rabbit" },
        { letter: "S", word: "Sun" },      { letter: "T", word: "Tiger" },
        { letter: "U", word: "Umbrella" }, { letter: "V", word: "Van" },
        { letter: "W", word: "Water" },    { letter: "X", word: "X-ray" },
        { letter: "Y", word: "Yarn" },     { letter: "Z", word: "Zebra" },
    ];

    await prisma.learningItem.createMany({
        data: englishLetters.map((l, i) => ({
            category: "ENGLISH_ALPHABET" as const,
            title: l.letter,
            imageUrl: `/images/english/${l.letter.toLowerCase()}.png`,
            phrases: [
                `${l.letter} is for ${l.word}.`,
                `This is the letter ${l.letter}.`,
                `${l.word} starts with ${l.letter}.`,
            ],
            sortOrder: i + 1,
        })),
        skipDuplicates: true,
    });

    // ==========================================
    // EMOTIONS
    // ==========================================
    await prisma.learningItem.createMany({
        data: [
            { category: "EMOTIONS", title: "Happy",   imageUrl: "/images/emotions/happy.png",   phrases: ["I am happy.", "I feel happy.", "Are you happy?"], sortOrder: 1 },
            { category: "EMOTIONS", title: "Sad",     imageUrl: "/images/emotions/sad.png",     phrases: ["I'm sad.", "Are you sad?", "Why are you sad?", "I'm not happy."], sortOrder: 2 },
            { category: "EMOTIONS", title: "Angry",   imageUrl: "/images/emotions/angry.png",   phrases: ["I am angry.", "I feel angry.", "I need to calm down."], sortOrder: 3 },
            { category: "EMOTIONS", title: "Scared",  imageUrl: "/images/emotions/scared.png",  phrases: ["I am scared.", "I feel scared.", "Don't be scared."], sortOrder: 4 },
            { category: "EMOTIONS", title: "Tired",   imageUrl: "/images/emotions/tired.png",   phrases: ["I am tired.", "I need to rest.", "I feel sleepy."], sortOrder: 5 },
            { category: "EMOTIONS", title: "Worried", imageUrl: "/images/emotions/worried.png", phrases: ["I am worried.", "I feel worried.", "Everything is okay."], sortOrder: 6 },
        ],
        skipDuplicates: true,
    });

    // ==========================================
    // COMMUNICATION
    // ==========================================
    await prisma.learningItem.createMany({
        data: [
            { category: "COMMUNICATION", title: "Hungry",  imageUrl: "/images/communication/hungry.png",  phrases: ["I'm hungry.", "Can I have food, please?", "Are you hungry?", "What's for lunch?"], sortOrder: 1 },
            { category: "COMMUNICATION", title: "Thirsty", imageUrl: "/images/communication/thirsty.png", phrases: ["I'm thirsty.", "Can I have water?", "I need a drink."], sortOrder: 2 },
            { category: "COMMUNICATION", title: "Shower",  imageUrl: "/images/communication/shower.png",  phrases: ["I need a shower.", "Time to shower.", "I want to be clean."], sortOrder: 3 },
            { category: "COMMUNICATION", title: "Play",    imageUrl: "/images/communication/play.png",    phrases: ["I want to play.", "Can we play?", "Let's play together."], sortOrder: 4 },
            { category: "COMMUNICATION", title: "Study",   imageUrl: "/images/communication/study.png",   phrases: ["I want to study.", "Time to learn.", "Let's study together."], sortOrder: 5 },
            { category: "COMMUNICATION", title: "Sleep",   imageUrl: "/images/communication/sleep.png",   phrases: ["I'm sleepy.", "I want to sleep.", "Goodnight."], sortOrder: 6 },
        ],
        skipDuplicates: true,
    });

    // ==========================================
    // CONVERSATION
    // ==========================================
    await prisma.learningItem.createMany({
        data: [
            { category: "CONVERSATION", title: "Me",     imageUrl: "/images/conversation/me.png",     phrases: ["This is me.", "I am here.", "My name is..."], sortOrder: 1 },
            { category: "CONVERSATION", title: "Hello",  imageUrl: "/images/conversation/hello.png",  phrases: ["Hello!", "Hi there!", "Good morning!"], sortOrder: 2 },
            { category: "CONVERSATION", title: "Yes",    imageUrl: "/images/conversation/yes.png",    phrases: ["Yes.", "Yes, please.", "I agree."], sortOrder: 3 },
            { category: "CONVERSATION", title: "No",     imageUrl: "/images/conversation/no.png",     phrases: ["No.", "No, thank you.", "I don't want."], sortOrder: 4 },
            { category: "CONVERSATION", title: "Help",   imageUrl: "/images/conversation/help.png",   phrases: ["Help me please.", "I need help.", "Can you help me?"], sortOrder: 5 },
            { category: "CONVERSATION", title: "What",   imageUrl: "/images/conversation/what.png",   phrases: ["What is this?", "What do you want?", "What happened?"], sortOrder: 6 },
            { category: "CONVERSATION", title: "Toilet", imageUrl: "/images/conversation/toilet.png", phrases: ["I need the toilet.", "Bathroom please.", "I need to go."], sortOrder: 7 },
            { category: "CONVERSATION", title: "Sleep",  imageUrl: "/images/conversation/sleep.png",  phrases: ["I want to sleep.", "I'm sleepy.", "Goodnight."], sortOrder: 8 },
        ],
        skipDuplicates: true,
    });



    // ==========================================
    // ARTICLES
    // ==========================================
    console.log("🌱 Seeding Articles...");

    await prisma.article.createMany({
        data: [
            {
                title: "Understanding Autism Spectrum Disorder",
                excerpt: "A comprehensive guide for parents on understanding autism and how to support their child.",
                content: "Autism Spectrum Disorder (ASD) is a developmental condition that affects communication, behavior, and social interaction. Early diagnosis and intervention can make a significant difference in a child's development. As a parent, understanding ASD is the first step to helping your child thrive.",
                imageUrl: "/images/articles/autism-guide.png",
                category: "Education",
                tags: ["autism", "parenting", "guide"],
                author: "Dr. Sarah Ahmed",
                featured: true,
            },
            {
                title: "How to Build Daily Routines for Autistic Children",
                excerpt: "Consistency made a huge difference. Small daily routines help children feel safe and confident.",
                content: "Children with autism thrive on routine and predictability. Establishing a consistent daily schedule can reduce anxiety and improve behavior. Start with simple routines like morning and bedtime schedules, and gradually build from there.",
                imageUrl: "/images/articles/daily-routine.png",
                category: "Parenting",
                tags: ["routine", "daily schedule", "tips"],
                author: "Dr. Mohamed Ali",
                featured: true,
            },
            {
                title: "Communication Strategies for Non-Verbal Children",
                excerpt: "Practical techniques to help your child communicate their needs effectively.",
                content: "Many children with autism are non-verbal or have limited verbal communication. There are many effective strategies to help them express themselves, including picture exchange communication systems (PECS), sign language, and augmentative and alternative communication (AAC) devices.",
                imageUrl: "/images/articles/communication.png",
                category: "Communication",
                tags: ["communication", "non-verbal", "strategies"],
                author: "Dr. Nadia Hassan",
                featured: false,
            },
            {
                title: "The Role of Play in Autism Therapy",
                excerpt: "How play-based activities can support cognitive and social development.",
                content: "Play is a powerful tool for children with autism. Through structured play activities, children can develop social skills, communication, and cognitive abilities. Learn how to use play therapy techniques at home to support your child's development.",
                imageUrl: "/images/articles/play-therapy.png",
                category: "Therapy",
                tags: ["play", "therapy", "development"],
                author: "Dr. Ahmed Karim",
                featured: false,
            },
            {
                title: "Managing Sensory Sensitivities",
                excerpt: "Understanding and managing sensory processing challenges in autistic children.",
                content: "Many children with autism experience heightened sensory sensitivities to sounds, lights, textures, and other stimuli. Understanding these sensitivities is key to supporting your child. Learn practical strategies to create a sensory-friendly environment at home and in public.",
                imageUrl: "/images/articles/sensory.png",
                category: "Health",
                tags: ["sensory", "sensitivity", "management"],
                author: "Dr. Layla Ibrahim",
                featured: false,
            },
        ],
        skipDuplicates: true,
    });

    console.log("✅ Seeding completed!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });