from dallinger.models import Node, Info
import random
import json

class Probe(Node):
    """ Just a node, but it needed a name. Also has a score property."""

    __mapper_args__ = {
        "polymorphic_identity": "Probe_node"
    }

    @property
    def score_in_pgg(self):
        return json.loads(self.property1)["score_in_pgg"]

    @property
    def condition(self):
        return json.loads(self.property2)["condition"]

    @property
    def Partnerscore(self):
        return json.loads(self.property3)["Partnerscore"]

    @score_in_pgg.setter
    def score_in_pgg(self, val):
        p1 = json.loads(self.property1)
        p1["score_in_pgg"] = val
        self.property1 = json.dumps(p1)

class Pogtwo(Node):
    """Version two of the pot of greed. Handles some experiment backend."""
    
    __mapper_args__ = {
        "polymorphic_identity": "pot_of_greed_bot"
    }
    
    def __init__(self, network):
        super().__init__(network)

    def update(self, infos):
        """This will handle working out the scores. Infos end up here whenever .receieve()
        is called in the backend"""

        # Find the nodes donation
        donation = int(infos[0].contents)

        # Calculate the earnings
        node = self.network.nodes(type=Probe)[0] # Get the node
        pog_donation = donation + random.randint(-4,4) # How much does the pog donate back?
        pog_donation = max(pog_donation, 0)
        pog_donation = min(pog_donation, 10)
        total = round((((pog_donation + donation) * 1.5) / 2),0) # What are the total earnings?
        node.score_in_pgg = node.score_in_pgg + (10 - donation) + total # Record the nodes earnings

        # Inform the node
        totalinfo = Info(origin = self, contents = total) # Their earnings
        self.transmit(what = totalinfo, to_whom = node)
        poginfo = Info(origin = self, contents = pog_donation) # The pogs donation
        self.transmit(what = poginfo, to_whom = node)
        leftovers = Info(origin = self, contents = (10 - donation)) # The nodes leftovers, for the benefit of JavaScript
        self.transmit(what = leftovers, to_whom = node)

class Donation(Info):
    """Info submitted when the participant is playing the PGG."""

    __mapper_args__ = {"polymorphic_identity": "Donation"}

class Choice(Info):
    """Info submitted when the participant chooses whether to be spiteful"""

    __mapper_args__ = {"polymorphic_identity": "Choice"}

class Condition(Info):
    """Info submitted when the participant generates their experimental condition"""

    __mapper_args__ = {"polymorphic_identity": "Condition"}

