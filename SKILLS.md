# Operational Skills - MOI Project

> Defines capabilities for efficient execution. Read this before starting work.

---

## 🎯 Core Principles

- **Token Efficiency** - Reference TECHNICAL_SUMMARY.md instead of scanning codebase
- **Minimal Actions** - One commit per logical change, batch related updates
- **Clean Execution** - No unnecessary files, clean up .tmp/ automatically
- **Plan First** - Propose short plan, wait for approval before building

---

## 💻 Web Development

### Frontend
- React (functional components, hooks)
- RTL/Arabic UI design
- Responsive mobile-first layouts
- State management (Context API)
- Form validation & UX patterns

### Backend
- Node.js/Express REST APIs
- PostgreSQL database design
- JWT authentication
- File uploads & static serving
- Email/notification systems

### Full-Stack
- API integration & error handling
- CORS & security headers
- Environment variable management
- Session/token management
- Real-time updates (polling/WebSocket)

---

## 🏗️ Architecture & Patterns

- **3-Layer Architecture** (Directive → Orchestration → Execution)
- RESTful API design
- Database normalization & indexing
- Workflow state machines
- Role-based access control (RBAC)
- Microservices communication
- Event-driven architectures

---

## 🔨 Code Building

- Read existing code structure first
- Follow project conventions (naming, formatting)
- Write modular, reusable components
- Handle errors gracefully
- Add inline comments for complex logic
- Validate inputs, sanitize outputs

---

## 🔍 Code Review

- Check for security vulnerabilities
- Verify business logic correctness
- Test edge cases mentally
- Suggest performance improvements
- Flag technical debt
- Ensure consistency with existing patterns

---

## 🌐 Web Scraping

- Respect robots.txt
- Rate limiting & politeness delays
- Handle dynamic content (JavaScript rendering)
- Parse HTML/JSON efficiently
- Error handling for network failures
- Data extraction & normalization

---

## 🤖 Automation

- Task scheduling (cron patterns)
- Webhook endpoints
- Batch processing scripts
- Data migration tools
- CI/CD pipeline integration
- Health checks & monitoring

---

## 🔌 API Integration

- OAuth 2.0 flows
- API key management
- Rate limit handling
- Retry logic with exponential backoff
- Webhook verification
- API documentation reading

---

## 📊 Data Management

- SQL query optimization
- Database migrations
- Data validation & sanitization
- Bulk insert/update strategies
- JSON/CSV data processing
- Caching strategies (Redis, in-memory)

---

## 🔐 Security

- Password hashing (bcrypt)
- JWT token validation
- SQL injection prevention
- XSS/CSRF protection
- Secure file uploads
- Environment secrets management

---

## 📦 Deployment

- **Render** - Web services, databases
- **Netlify** - Static sites, serverless functions
- **Vercel** - Next.js, static hosting
- Environment variable configuration
- Domain/DNS setup
- SSL certificate management

---

## 🧪 Testing & Debugging

- Console.log debugging
- API endpoint testing (Postman/curl)
- Database query testing
- Browser DevTools inspection
- Error log analysis
- Performance profiling

---

## 📝 Documentation

- Technical summaries (TECHNICAL_SUMMARY.md style)
- API endpoint documentation
- Setup/deployment guides
- Code comments for complex logic
- README with quick-start instructions

---

## 🚀 Productivity Skills

### Information Gathering
1. Read TECHNICAL_SUMMARY.md first
2. Use Grep to find specific code
3. Read only relevant files
4. Ask clarifying questions before building

### Efficient Workflows
- Git: Batch related changes in one commit
- Files: Clean up temporary files automatically
- Plans: Propose → Approve → Execute
- Updates: Incremental, testable changes

### Problem Solving
1. Understand the requirement
2. Check existing implementation
3. Propose minimal change
4. Test edge cases
5. Document if complex

---

## 🛠️ Common Tasks

### Add New Feature
1. Read TECHNICAL_SUMMARY.md for context
2. Identify affected files
3. Propose implementation plan
4. Make minimal changes
5. Test workflow end-to-end
6. Update TECHNICAL_SUMMARY.md if significant

### Fix Bug
1. Reproduce the issue
2. Find root cause (logs, debugging)
3. Propose fix
4. Verify fix doesn't break other features
5. Test edge cases

### Refactor Code
1. Identify improvement opportunity
2. Ensure tests exist (or add them)
3. Make incremental changes
4. Verify behavior unchanged
5. Update documentation if needed

### Add Integration
1. Read API documentation
2. Store credentials in .env
3. Create dedicated route/module
4. Handle errors & rate limits
5. Test with real API
6. Document usage

---

## ⚡ Performance Optimization

- Lazy load components
- Database query optimization (indexes, EXPLAIN)
- Cache frequently accessed data
- Compress images/assets
- Minimize API calls
- Use pagination for large datasets

---

## 🎨 UI/UX Best Practices

- Mobile-first responsive design
- Loading states for async operations
- Error messages in user's language
- Keyboard navigation support
- Accessible forms (labels, aria)
- Consistent spacing/typography

---

## 📱 Mobile Development (Future)

- React Native setup
- Native module integration
- Push notifications
- Offline-first architecture
- App store deployment

---

## 🔄 Version Control

- Clear commit messages
- One logical change per commit
- Branch naming conventions
- PR/code review process
- Semantic versioning

---

## 💡 Decision Framework

**When adding a feature:**
1. Is it in the requirements? (Check directives)
2. Does it fit the architecture? (Check TECHNICAL_SUMMARY.md)
3. What's the minimal implementation?
4. What are the edge cases?
5. How will it be tested?

**When debugging:**
1. What's the expected behavior?
2. What's the actual behavior?
3. Where does it diverge? (logs, breakpoints)
4. What's the root cause?
5. What's the minimal fix?

---

## 📚 References

- **CLAUDE.md** - Operating principles & 3-layer architecture
- **TECHNICAL_SUMMARY.md** - Current system state & capabilities
- **DEPLOYMENT_GUIDE.md** - Deployment procedures

---

**Read this file at the start of each session for optimal performance.**
