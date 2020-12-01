from dallinger.models import Node, Info
import random
import json


def bound(x, lower, upper):
    return max(min(x, upper), lower)


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

    def update(self, infos):
        """This will handle working out the scores. Infos end up here whenever .receieve()
        is called in the backend"""

        node_donation = int(infos[0].contents)
        pog_donation = bound(node_donation + random.randint(-4, 4), 0, 10)
        total_earnings = round((pog_donation + node_donation) * 0.75, 0)

        node = infos[0].origin
        node.score_in_pgg = node.score_in_pgg + 10 - node_donation + total_earnings

        # Inform the node
        totalinfo = Info(origin=self, contents=total_earnings)  # Their earnings
        self.transmit(what=totalinfo, to_whom=node)
        poginfo = Info(origin=self, contents=pog_donation)  # The pogs donation
        self.transmit(what=poginfo, to_whom=node)
        leftovers = Info(origin=self, contents=(10 - node_donation))  # The nodes leftovers, for the benefit of JavaScript
        self.transmit(what=leftovers, to_whom=node)
        score = Info(origin=self, contents=node.score_in_pgg)  # The nodes total score, for the benefit of Javascript
        self.transmit(what=score, to_whom=node)


class Donation(Info):
    """Info submitted when the participant is playing the PGG."""

    __mapper_args__ = {"polymorphic_identity": "Donation"}


class Reduction(Info):
    """Info submitted when the participant chooses whether to be spiteful"""

    __mapper_args__ = {"polymorphic_identity": "Reduction"}


class Condition(Info):
    """Info submitted when the participant generates their experimental condition"""

    __mapper_args__ = {"polymorphic_identity": "Condition"}
