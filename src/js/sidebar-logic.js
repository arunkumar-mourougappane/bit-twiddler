/**
 * Sidebar Controller
 * Manages category accordions, search filtering, and persistence.
 */

export function initSidebar() {
  const searchInput = document.getElementById('sidebar-search');
  const categoryGroups = document.querySelectorAll('.category-group');
  const navLinks = document.querySelectorAll('.nav-link');
  
  // 1. Persistence Initialization
  loadSidebarState();

  // 2. Accordion Toggles
  categoryGroups.forEach(group => {
    const header = group.querySelector('.category-header');
    header.addEventListener('click', () => {
      // Toggle expanded class
      const isExpanded = group.classList.toggle('expanded');
      
      // Save state
      const categoryId = group.getAttribute('data-category');
      saveSidebarState(categoryId, isExpanded);
    });
  });

  // 3. Search Logic
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      filterSidebar(query);
    });

    // Keyboard shortcut ( / ) to focus search
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }

  /**
   * Loads collapsed/expanded state from localStorage
   */
  function loadSidebarState() {
    const savedState = JSON.parse(localStorage.getItem('bit-twiddler-sidebar-state') || '{}');
    
    categoryGroups.forEach(group => {
      const categoryId = group.getAttribute('data-category');
      // Default to expanded (true) if not found
      const shouldExpand = savedState[categoryId] !== false;
      
      if (shouldExpand) {
        group.classList.add('expanded');
      } else {
        group.classList.remove('expanded');
      }
    });
  }

  /**
   * Saves expansion state to localStorage
   */
  function saveSidebarState(categoryId, isExpanded) {
    const savedState = JSON.parse(localStorage.getItem('bit-twiddler-sidebar-state') || '{}');
    savedState[categoryId] = isExpanded;
    localStorage.setItem('bit-twiddler-sidebar-state', JSON.stringify(savedState));
  }

  /**
   * Filters tools and expands categories containing matches
   */
  function filterSidebar(query) {
    if (!query) {
      // Reset if empty
      categoryGroups.forEach(group => {
        group.classList.remove('hidden');
        // Restore from storage layout or default to expanded
        loadSidebarState();
      });
      navLinks.forEach(link => {
        link.closest('li').classList.remove('hidden');
      });
      return;
    }

    categoryGroups.forEach(group => {
      const linksInGroup = group.querySelectorAll('.nav-link');
      let groupHasMatch = false;

      linksInGroup.forEach(link => {
        const text = link.innerText.toLowerCase();
        const li = link.closest('li');
        
        if (text.includes(query)) {
          li.classList.remove('hidden');
          groupHasMatch = true;
        } else {
          li.classList.add('hidden');
        }
      });

      if (groupHasMatch) {
        group.classList.remove('hidden');
        group.classList.add('expanded'); // Force expand groups with matches
      } else {
        group.classList.add('hidden');
      }
    });
  }
}
