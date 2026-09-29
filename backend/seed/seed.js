require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Category = require('../models/Category');
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const cats = ['Technology', 'Programming', 'Web Development', 'Artificial Intelligence', 'Data Science', 'Career', 'Education', 'Design', 'Productivity', 'Lifestyle'];
const topics = [
  ['Getting Started with React Hooks', 'Web Development', ['react', 'javascript'], 'useState and useEffect let function components hold state and run side effects without classes. Start with useState for local values, then use useEffect for data fetching, remembering to clean up subscriptions and list dependencies honestly.'],
  ['Understanding REST API Design', 'Programming', ['api', 'node'], 'A good REST API uses nouns for resources, HTTP verbs for actions and status codes that tell the truth. Return 201 on creation, 400 for bad input, 401 versus 403 for authentication versus permission, and keep responses consistent.'],
  ['MongoDB Indexing for Beginners', 'Programming', ['mongodb', 'database'], 'Without an index MongoDB scans every document. Add indexes on fields you filter and sort by, such as slug or email, and use explain() to confirm a query uses them. Too many indexes slow writes, so measure first.'],
  ['How JWT Authentication Really Works', 'Web Development', ['jwt', 'security'], 'A JSON Web Token is a signed string carrying a user id. The server verifies the signature on each request instead of storing sessions. Keep the secret private, set an expiry and never put passwords inside a token.'],
  ['A Practical Introduction to Machine Learning', 'Artificial Intelligence', ['ml', 'python'], 'Machine learning finds patterns in data instead of following hand-written rules. Split data into training and test sets, pick a simple baseline model first, and judge it on data it has never seen.'],
  ['CSS Grid vs Flexbox: When to Use Which', 'Web Development', ['css', 'design'], 'Flexbox arranges items along one axis, while Grid controls rows and columns together. Use Flexbox for navbars and card rows, and Grid for page layouts and galleries.'],
  ['Writing a Developer Resume That Gets Interviews', 'Career', ['resume', 'career'], 'Lead with projects and measurable outcomes. Describe what you built, the stack, and one number such as users, speed or test coverage. Link your GitHub and keep it to one page.'],
  ['Deep Work: Focus in a Distracted World', 'Productivity', ['focus', 'habits'], 'Block two uninterrupted hours, silence notifications and pick one task. Track your sessions for a week; most people are surprised how little focused time they actually get.'],
  ['Data Cleaning with Pandas', 'Data Science', ['pandas', 'python'], 'Real datasets have missing values, duplicates and inconsistent types. Use isna, drop_duplicates and astype early, and keep the cleaning steps in a script so results are reproducible.'],
  ['Design Principles Every Developer Should Know', 'Design', ['ui', 'ux'], 'Contrast, alignment, spacing and hierarchy do most of the work. Choose one typeface, a small colour palette and consistent spacing steps, and your interface instantly looks deliberate.'],
  ['Git Workflow for Small Teams', 'Technology', ['git', 'teamwork'], 'Use short-lived feature branches, small commits with clear messages and pull requests for review. Rebase or merge often so branches never drift far from main.'],
  ['Node.js Error Handling Done Right', 'Programming', ['node', 'express'], 'Wrap async route handlers in try/catch and forward errors to a central error middleware. Return safe messages to clients and log the details on the server only.'],
  ['Learning to Code Without Burning Out', 'Education', ['learning', 'beginners'], 'Build small projects instead of only watching tutorials. Review yesterday before starting today, and rest deliberately. Consistency for thirty minutes beats one exhausting weekend.'],
  ['Prompt Engineering Basics', 'Artificial Intelligence', ['ai', 'llm'], 'Clear prompts state the role, the task, the format and an example. Iterate: change one thing at a time and compare outputs, the same way you would debug code.'],
  ['Responsive Design Without Frameworks', 'Design', ['css', 'responsive'], 'Start mobile-first, use relative units, and add breakpoints only where the layout breaks. Test at 320px, 768px and 1440px to catch overflow early.'],
  ['SQL vs NoSQL: Choosing a Database', 'Technology', ['database', 'sql'], 'Relational databases shine with structured, related data and transactions. Document stores like MongoDB suit flexible, nested data. Choose from your access patterns, not from hype.'],
  ['Building Habits That Stick', 'Lifestyle', ['habits', 'wellbeing'], 'Attach a new habit to an existing one, make it tiny and celebrate finishing it. Sleep, movement and a short daily walk improve coding sessions more than another coffee.'],
  ['Visualising Data with Charts', 'Data Science', ['visualization', 'data'], 'Pick the chart for the question: lines for trends, bars for comparison, scatter for relationships. Label axes, avoid 3D effects and remove anything that does not help the reader.'],
  ['Preparing for Your First Technical Interview', 'Career', ['interview', 'career'], 'Practise explaining your own projects aloud, revise core data structures, and think out loud on problems. Interviewers value clear reasoning as much as the final answer.'],
  ['Accessibility Basics for the Web', 'Web Development', ['accessibility', 'html'], 'Use semantic HTML, label every form field, keep colour contrast high and make everything usable by keyboard. Accessible sites are better for everyone.'],
  ['Deploying a MERN App to the Cloud', 'Technology', ['deployment', 'mern'], 'Host MongoDB on Atlas, the API on Render or Railway and the React build on Vercel or Netlify. Set environment variables in each dashboard and allow the frontend origin in CORS.'],
];
const extra = ['Here is how I would approach it in a real project.', 'A common mistake is skipping the fundamentals, so slow down at the start.', 'Try it on a small example first, then apply it to your own work.'];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await Promise.all([User.deleteMany(), Post.deleteMany(), Comment.deleteMany(), Category.deleteMany()]);
  const categories = await Category.insertMany(cats.map((name) => ({ name, slug: slugify(name), description: `${name} articles` })));
  const cid = Object.fromEntries(categories.map((c) => [c.name, c._id]));
  await User.create({ name: process.env.ADMIN_NAME || 'BlogSphere Admin', username: 'admin', email: (process.env.ADMIN_EMAIL || 'admin@blogsphere.com').toLowerCase(), password: process.env.ADMIN_PASSWORD || 'Admin@123', role: 'ADMIN', bio: 'BlogSphere administrator' });
  const users = [];
  for (const [n, u] of [['Aarav Kumar', 'aarav'], ['Meera Iyer', 'meera'], ['Rohan Das', 'rohan']])
    users.push(await User.create({ name: n, username: u, email: `${u}@blogsphere.com`, password: 'User@1234', bio: `${n} writes about software and learning.` }));
  const posts = [];
  for (let i = 0; i < topics.length; i++) {
    const [title, cat, tags, body] = topics[i];
    const content = `${body}\n\n${extra[i % 3]}\n\n${body.split('. ')[0]}. Keep practising, and share what you learn with others.`;
    const words = content.split(/\s+/).length;
    posts.push(await Post.create({
      title, slug: `${slugify(title)}-${i}`, excerpt: body.slice(0, 140) + '...', content, category: cid[cat], tags,
      author: users[i % 3]._id, status: 'published', views: 20 + ((i * 37) % 300), publishedAt: new Date(Date.now() - i * 86400000),
      featuredImage: `https://picsum.photos/seed/blogsphere${i}/900/500`, wordCount: words, readingTime: Math.max(1, Math.ceil(words / 200)),
      likes: users.slice(0, (i % 3) + 1).map((u) => u._id),
    }));
  }
  for (let i = 0; i < 8; i++) {
    const top = await Comment.create({ post: posts[i]._id, author: users[(i + 1) % 3]._id, content: 'Really clear explanation, this helped me understand the topic better.' });
    await Comment.create({ post: posts[i]._id, author: users[i % 3]._id, parent: top._id, content: 'Glad it helped! Let me know if you want a follow-up post.' });
  }
  console.log(`Seeded. Admin: ${process.env.ADMIN_EMAIL || 'admin@blogsphere.com'} | Users: aarav|meera|rohan@blogsphere.com / User@1234`);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
