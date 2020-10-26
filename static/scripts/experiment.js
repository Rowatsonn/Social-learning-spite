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
    numTransmissions = 0 // Set to 0. Once its 5, move on.
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
    info_type: type
  }).done(function(resp) {
    hideExperiment();
    checkTransmit();
  }).fail(function (rejection) {
    go_to_questionnaire();
  });
}

function hideExperiment(){
  // Hide the experiment
  $("#headerone").hide();
  $("#Waiting").show();
  $("#PGGrow").hide();
  $("#Submitbutton").hide(); 
}

function checkTransmit (){
  // Check for transmissions from the pog
  dallinger.getTransmissions(my_node_id, {
    status: "pending"
  }) 
  .done(function (resp){
    transmissions = resp.transmissions;
    if (transmissions.length == 3){
      processTransmit(transmissions)
    } else {
      setTimeout(function(){
        checkTransmit();
      }, 1000 ) // Keep checking transmissions
    }
  })
}

function processTransmit(transmissions){
  // Extract the needed info
  numTransmissions = numTransmissions + 1;
  potID = transmissions[0].info_id;
  donID = transmissions[1].info_id;
  leftoverID = transmissions[2].info_id;
  dallinger.getInfo(my_node_id, potID)
    .done(function(resp) {
        pot = resp.info.contents;
    })
  dallinger.getInfo(my_node_id, donID)
    .done(function(resp) {
        donation = resp.info.contents; 
    })
  dallinger.getInfo(my_node_id, leftoverID)
    .done(function(resp) {
        leftovers = resp.info.contents; 
    })
  setTimeout(function(){ // Wait 2 seconds to allow the above functions to run
    showResults(pot, donation, leftovers)
  }, 2000)
}

function showResults(pot, donation, leftovers){
  // Display the results
  $("#Waiting").hide();
  $("#partner").html("This round your partner donated: " + donation);
  $("#partner").show();
  $("#earnings").html("This round, your total earnings were: " + (parseInt(pot) + parseInt(leftovers)))
  $("#earnings").show();
}
