$(document).ready(function() {

  // do not allow user to close or reload
  dallinger.preventExit = true;

  // Consent to the experiment.
  $("#consent").click(function() {
    store.set("recruiter", dallinger.getUrlParameter("recruiter"));
    store.set("hit_id", dallinger.getUrlParameter("hit_id"));
    store.set("worker_id", dallinger.getUrlParameter("worker_id"));
    store.set("assignment_id", dallinger.getUrlParameter("assignment_id"));
    store.set("mode", dallinger.getUrlParameter("mode"));

    dallinger.allowExit();
    dallinger.goToPage('instructions/quiz_instructions');
  });
});

// Create the agent. Runs when the page opens.
function createAgent () {
  // Setup participant and get node id
  dallinger.createAgent()
  .done(function (resp) {
    // Sets node ID and network ID to a cookie. May or may not be needed. 
    my_node_id = resp.node.id;
    store.set("my_node_id", my_node_id);
    my_network_id = resp.node.network_id;
    dallinger.storage.set("my_network_id", my_network_id);
  })
  .fail(function (rejection) {
    dallinger.allowExit();
    dallinger.error(rejection);
  });
};

// Function for response submission. Works for both PGG and spite choices
function submitResponse(response, type) {
  dallinger.createInfo(my_node_id, {
    contents: response,
    info_type: type,
    details: JSON.stringify(question_json)
  }).done(function(resp) {
    console.log("Info made")
    checkTransmit();
  }).fail(function (rejection) {
    go_to_questionnaire();
  });
}

function checkTransmit (){
  // Check for transmissions from the pog
  dallinger.getTransmissions(my_node_id, {
    status: "pending"
  }) 
  .done(function (resp){
    transmissions = resp.transmissions;
    if (transmissions.length == 1){
      processTransmit(transmissions[0].info_id)
    } else {
      setTimeout(function(){
        checkTransmit();
      }, 1000 ) // Keep checking transmissions
    }
  })
}

function processTransmit(ID){
  // If it finds a transmission from the POG
  dallinger.getInfo(my_node_id, ID)
  .done(function(resp){
    console.log("Score will be displayed")
  })
}
