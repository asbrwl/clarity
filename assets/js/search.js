(function () {
  "use strict";

  const SUMMARY_INCLUDE = 160;
  const FUSE_OPTIONS = {
    shouldSort: true,
    includeMatches: true,
    threshold: 0.3,
    location: 0,
    distance: 100,
    minMatchCharLength: 3,
    keys: [
      { name: "title", weight: 0.8 },
      { name: "contents", weight: 0.5 },
      { name: "tags", weight: 0.3 },
    ],
  };

  // Cache for search index (in-memory fallback)
  let searchIndexCache = null;

  // Cache version from Hugo config (set via data attribute in HTML)
  const CACHE_VERSION =
    document.documentElement.getAttribute("data-search-cache-version") || "1.0";
  const CACHE_KEY = "searchIndex";
  const CACHE_VERSION_KEY = "searchIndexVersion";

  const searchQuery = param("s");
  if (searchQuery) {
    document.getElementById("search-query").value = searchQuery;
    executeSearch(searchQuery);
  }

  function executeSearch(searchQuery) {
    // Try to get cached index from sessionStorage
    const cachedData = getSearchIndex();

    if (cachedData) {
      performSearch(cachedData, searchQuery);
    } else {
      // Fetch and cache the index
      fetch("/index.json")
        .then(function (response) {
          if (!response.ok) throw new Error("Failed to load search index");
          return response.json();
        })
        .then(function (data) {
          setSearchIndex(data);
          performSearch(data, searchQuery);
        })
        .catch(function (error) {
          document.getElementById("search-results").innerHTML =
            "<p>Search is temporarily unavailable. Please try again later.</p>";
          console.error("Search error:", error);
        });
    }
  }

  function getSearchIndex() {
    // First check in-memory cache
    if (searchIndexCache) {
      return searchIndexCache;
    }

    // Check sessionStorage
    try {
      const cachedVersion = sessionStorage.getItem(CACHE_VERSION_KEY);

      // Validate cache version
      if (cachedVersion === CACHE_VERSION) {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          searchIndexCache = JSON.parse(cached);
          return searchIndexCache;
        }
      } else if (cachedVersion) {
        // Cache version mismatch, clear old cache
        sessionStorage.removeItem(CACHE_KEY);
        sessionStorage.removeItem(CACHE_VERSION_KEY);
      }
    } catch (e) {
      // sessionStorage might be disabled or full
    }

    return null;
  }

  function setSearchIndex(data) {
    // Store in memory
    searchIndexCache = data;

    // Try to store in sessionStorage
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
      sessionStorage.setItem(CACHE_VERSION_KEY, CACHE_VERSION);
    } catch (e) {
      // sessionStorage might be disabled or full
    }
  }

  function performSearch(pages, searchQuery) {
    const fuse = new Fuse(pages, FUSE_OPTIONS);
    const result = fuse.search(searchQuery);
    const searchResults = document.getElementById("search-results");

    // Clear previous results
    searchResults.innerHTML = "";

    if (result.length > 0) {
      populateResults(result);
    } else {
      searchResults.innerHTML = "<p>No matches found</p>";
    }
  }

  function escapeHtml(text) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, function (m) {
      return map[m];
    });
  }

  function populateResults(result) {
    const searchResults = document.getElementById("search-results");
    const templateDefinition = document.getElementById(
      "search-result-template"
    ).innerHTML;

    result.forEach(function (value, key) {
      const contents = value.item.contents;
      let snippet = "";
      const snippetHighlights = [];

      value.matches.forEach(function (mvalue) {
        if (mvalue.key === "tags") {
          snippetHighlights.push(mvalue.value);
        } else if (mvalue.key === "contents") {
          const start =
            mvalue.indices[0][0] - SUMMARY_INCLUDE > 0
              ? mvalue.indices[0][0] - SUMMARY_INCLUDE
              : 0;
          const end =
            mvalue.indices[0][1] + SUMMARY_INCLUDE < contents.length
              ? mvalue.indices[0][1] + SUMMARY_INCLUDE
              : contents.length;
          snippet += contents.substring(start, end);
          snippetHighlights.push(
            mvalue.value.substring(
              mvalue.indices[0][0],
              mvalue.indices[0][1] - mvalue.indices[0][0] + 1
            )
          );
        }
      });

      if (snippet.length < 1) {
        snippet += contents.substring(0, SUMMARY_INCLUDE * 2);
      }

      // Replace values with escaped HTML to prevent XSS
      const output = render(templateDefinition, {
        key: key,
        title: escapeHtml(value.item.title),
        link: escapeHtml(value.item.permalink),
        tags: value.item.tags,
        snippet: escapeHtml(snippet),
      });
      searchResults.insertAdjacentHTML("beforeend", output);

      // Highlight matches using vanilla mark.js
      const summaryElement = document.getElementById("summary-" + key);
      if (summaryElement) {
        const markInstance = new Mark(summaryElement);
        snippetHighlights.forEach(function (snipvalue) {
          markInstance.mark(snipvalue);
        });
      }
    });
  }

  function param(name) {
    return decodeURIComponent(
      (location.search.split(name + "=")[1] || "").split("&")[0]
    ).replace(/\+/g, " ");
  }

  function render(templateString, data) {
    const conditionalPattern =
      /\$\{\s*isset ([a-zA-Z]*) \s*\}(.*)\$\{\s*end\s*}/g;
    // Since loop below depends on re.lastIndex, we use a copy to capture any manipulations whilst inside the loop
    let copy = templateString;
    let conditionalMatches;

    while (
      (conditionalMatches = conditionalPattern.exec(templateString)) !== null
    ) {
      if (data[conditionalMatches[1]]) {
        // Valid key, remove conditionals, leave contents.
        copy = copy.replace(conditionalMatches[0], conditionalMatches[2]);
      } else {
        // Not valid, remove entire section
        copy = copy.replace(conditionalMatches[0], "");
      }
    }

    templateString = copy;

    // Now any conditionals removed we can do simple substitution
    for (const key in data) {
      const find = "\\$\\{\\s*" + key + "\\s*\\}";
      const re = new RegExp(find, "g");
      templateString = templateString.replace(re, data[key]);
    }

    return templateString;
  }
})();
