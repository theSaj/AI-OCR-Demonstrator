document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');

    // Inject Layout
    app.insertAdjacentHTML('afterbegin', `
        <div class="overlay" id="overlay"></div>
        <aside class="site-sidebar" id="sidebar">
            <div class="brand">
                <h2 style="color: var(--primary-color);">Antigravity</h2>
            </div>
            <ul class="nav-links">
                <li class="nav-item">
                    <a href="index.html" class="nav-link">
                        <span>Home</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="about.html" class="nav-link">
                        <span>About Us</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="processor.html" class="nav-link">
                        <span>Processor</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="author.html" class="nav-link">
                        <span>Author</span>
                    </a>
                </li>
            </ul>
        </aside>
        <header class="site-header">
            <button class="menu-toggle" id="menuToggle">☰</button>
            <div class="header-title">Antigravity Concept</div>
            <div style="width: 24px;"></div> <!-- Spacer for balance -->
        </header>
    `);

    app.insertAdjacentHTML('beforeend', `
        <footer class="site-footer">
            &copy; ${new Date().getFullYear()} Antigravity Project. All rights reserved.
        </footer>
    `);

    // Highlight Active Link
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });

    // Mobile Menu Logic
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    function toggleMenu() {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    }

    menuToggle.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);

    // Close menu when clicking a link on mobile
    links.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                toggleMenu();
            }
        });
    });
});
