'use strict'

function execute() {
	try {
	    //Scrape Fields and Create Fields list object.
	    let fields = scrapeFields();

	    //Adding Listener for Top Frame to Receive Fields.
	    if (isTopFrame()) {
	        let expectedFrames = 2;
	        let collectedFields = [...fields];

	        window.addEventListener('message', (event) => {
	            if (event.data && event.data.fields) {
	                collectedFields.push(...event.data.fields);
	            }

	            expectedFrames--;

	            if (expectedFrames === 0) {
	                // Fields of all frames
	                collectedFields.sort((a, b) => {
	                    return Object.keys(a)[0].localeCompare(Object.keys(b)[0]);
	                });

	                const framesLoadedEvent = new CustomEvent('frames:loaded', {
	                    detail: {
	                        fields: collectedFields
	                    }
	                });
	                document.dispatchEvent(framesLoadedEvent);
	            }
	        });

	    } else {
	        // Child frames sending fields to Top Frame.
	        getTopFrame().postMessage({ fields: fields }, '*');
	    }
	} catch (e) {
	    console.error(e);
	}
}

function scrapeFields() {
    let fieldsList = [];
    let formElements = document.querySelectorAll('input, select');

    formElements.forEach(element => {
        let name = element.name;
        let label = document.querySelector(`label[for="${name}"]`);
        if (label) {
            let fieldObject = {};
            fieldObject[name] = label.innerText.trim();
            fieldsList.push(fieldObject);
        }
    });

    return fieldsList;
}

execute();

//getting the top frame.
function getTopFrame() {
    return window.top.frames[0];
}

function isTopFrame() {
    return window.location.pathname == '/context.html';
}
