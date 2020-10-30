// Create the agent. Runs when the page opens.
function createAgent () {
  // Setup participant and get node id
  dallinger.createAgent()
  .done(function (resp) {
    my_node_id = resp.node.id;
    store.set("my_node_id", my_node_id);
    my_network_id = resp.node.network_id;
    dallinger.storage.set("my_network_id", my_network_id);
    numTransmissions = 0; // Set to 0. Once its 5, move on.
    Score = 0; // Updated throughout and saved as a cookie for later
    $("#assign").hide();
    $("#partnerid").html("Your partner is Participant " + (parseInt(dallinger.identity.participantId) + 3));
    $("#partnerid").show();
    advanceExperiment();
  })
  .fail(function (rejection) {
    dallinger.allowExit();
    dallinger.error(rejection);
  });
};

function Questionaire() {
  dallinger.allowExit();
  dallinger.goToPage('survey');
}

// Function for response submission. Works for both PGG and spite choices
function submitResponse(response, type) {
  dallinger.createInfo(my_node_id, {
    contents: response,
    info_type: type
  }).done(function(resp) {
    if(type == "Donation"){
      hideExperiment();
      checkTransmit()
    } else {
      Questionaire();
    }
  }).fail(function (rejection) {
    Questionaire();
  });
}

// Hide the experiment
function hideExperiment(){
  $("#headerone").hide();
  $("#Waiting").show();
  $("#PGGrow").hide();
  $("#Submitbutton").hide(); 
}

// Check for transmissions from the pog
function checkTransmit (){
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
      }, 1000 )
    }
  })
}

function processTransmit(transmissions){
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
  setTimeout(function(){ // Wait X seconds to allow the above functions to run + add believable delay
    showResults(pot, donation, leftovers)
  }, 2000)
}

function showResults(pot, donation, leftovers){
  $("#Waiting").hide();
  $("#partner").html("Your partner donated: " + donation);
  $("#partner").show();
  $("#earnings").html("Your total earnings were: " + (parseInt(pot) + parseInt(leftovers)))
  $("#earnings").show();
  Score = Score + (parseInt(pot) + parseInt(leftovers));
  $("#OK").show();
}

function advanceExperiment() {
  $("#partner").hide();
  $("#earnings").hide();
  $("#OK").hide();
  if(numTransmissions < 6){
    $("#headerone").show();
    $("#PGGrow").show();
    $("#Submitbutton").show(); 
  } else {
    dallinger.storage.set("Score", Score);
    dallinger.goToPage('instructions/Interim')
  }
}

// Interim page code
function randomiseCondition() {
  my_node_id = dallinger.storage.get("my_node_id");
  conditions = new Array (
    "Asocial",
    "Ranspite",
    "Rancompassion",
    "Topspite",
    "Topcompassion"
  );
  selection = conditions[Math.floor(Math.random() * (4 - 0)) + 0];
  dallinger.createInfo(my_node_id, {
    contents: selection,
    info_type: 'Condition'
  });
  return selection;
}

function changePartners() {
    setTimeout(function(){
      $("#Partner").hide();
      $("#Instructions").show();
      $("#Next").show();
    }, 4000)
  }

// Spite page code
function randomiseScore(){
  num = Math.floor((Math.random() * 80) + 40);
  dallinger.createInfo(my_node_id, {
    contents: num,
    info_type: 'Condition'
  });
  return num
}

function showReduce(){
  $("#Whatdo").html("Reduce their partners earnings");
  $("#Whatdo").show();
  $("#OK").show();
}

function showCompassion() {
  $("#Whatdo").html("Not reduce their partners earnings");
  $("#Whatdo").show();
  $("#OK").show();
}

function advanceSpite() {
  $("#Socialinfo").hide();
  $("#spitecont").show();
  $("#OK").hide();
  $("#Whatdo").hide();
}

function startSpite(condition) {
  my_node_id = dallinger.storage.get("my_node_id");
  $("#Score").html("Your partner's score is: " + randomiseScore());
  $("#YourScore").html("Your score is: " + dallinger.storage.get("Score"));
  $("#partnerid").html("Your partner is Participant " + (parseInt(dallinger.identity.participantId) + 1));
  $("#partnerid").show();
  switch(condition) {
    case 'Asocial':
    $("#Socialinfo").hide();
    $("#spitecont").show();
    break;
    case 'Ranspite':
    $("#Socialinfo").html("Participant " + (parseInt(dallinger.identity.participantId) + 2) + " in your group decided to: ");
    showReduce();
    break;
    case 'Rancompassion':
    $("#Socialinfo").html("Participant " + (parseInt(dallinger.identity.participantId) + 2) + " in your group decided to: ");
    showCompassion();
    break;
    case 'Topspite':
    $("#Socialinfo").html("The highest scoring member of your group (Participant " + (parseInt(dallinger.identity.participantId) + 2) + ") decided to: ");
    showReduce();
    break;
    case 'Topcompassion':
    $("#Socialinfo").html("The highest scoring member of your group (Participant " + (parseInt(dallinger.identity.participantId) + 2) + ") decided to: ");
    showCompassion();
    break;
  }
}

// ALT PAGE TESTER CODE DELETE AFTERWARDS

function altPage() { 
  my_node_id = dallinger.storage.get("my_node_id");
  $("#Score").html(randomiseScore());
  Score = parseInt($("#Score").html());
  $("#YourScore").html(dallinger.storage.get("Score"));
  yourScore = parseInt($("#YourScore").html());
}

function updatePoints(value) {
  value = parseInt(value);
  $("#Score").html(Score - (value * 3))
  $("#YourScore").html(yourScore - value);
}

