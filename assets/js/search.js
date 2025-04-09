(function() {
    function displaySearchResults(results, store) {
        const searchResults = document.getElementById('search-results');
        if (results.length) {
            let resultList = '';
            for (const n in results) {
                const item = store[results[n].ref];
                resultList += '<li><h3><a href="' + item.url + '">' + item.title + '</a></h3>';
                resultList += '<p>' + item.excerpt + '</p></li>';
            }
            searchResults.innerHTML = '<ul>' + resultList + '</ul>';
        } else {
            searchResults.innerHTML = '<p>No results found</p>';
        }
    }

    function getQueryVariable(variable) {
        const query = window.location.search.substring(1);
        const vars = query.split('&');

        for (const i = 0; i < vars.length; i++) {
            const pair = vars[i].split('=');

            if (pair[0] === variable) {
                return decodeURIComponent(pair[1].replace(/\+/g, '%20'));
            }
        }
    }

    const searchTerm = getQueryVariable('query');

    if (searchTerm) {
        document.getElementById('search-box').setAttribute("value", searchTerm);

        fetch('/search.json')
            .then(response => response.json())
            .then(data => {
                const store = {};
                
                // Index posts
                data.posts.forEach(post => {
                    store[post.url] = {
                        'title': post.title,
                        'url': post.url,
                        'excerpt': post.excerpt
                    };
                });

                // Index pages
                data.pages.forEach(page => {
                    store[page.url] = {
                        'title': page.title,
                        'url': page.url,
                        'excerpt': page.excerpt
                    };
                });

                const idx = lunr(function () {
                    this.field('title', { boost: 10 });
                    this.field('excerpt');
                    
                    for (const key in store) {
                        this.add({
                            'id': key,
                            'title': store[key].title,
                            'excerpt': store[key].excerpt
                        });
                    }
                });

                const results = idx.search(searchTerm);
                displaySearchResults(results, store);
            });
    }
})(); 