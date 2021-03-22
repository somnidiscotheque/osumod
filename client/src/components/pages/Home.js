import React, { Component } from "react";
import "../../utilities.css";
import "./Home.css";

import { navigate } from "@reach/router";
import { Layout, Button, Radio } from "antd";
import { get, post } from "../../utilities";
import QueueList from "../modules/QueueList";
import ModeIcon from "../modules/ModeIcon";
const { Content } = Layout;

const isBN = (q) => q.modderType === "full" || q.modderType === "probation";

class Home extends Component {
  constructor(props) {
    super(props);
    this.form = React.createRef();
    this.state = { queues: [], creating: false };
  }

  componentDidMount() {
    get("/api/queues").then((queues) => this.setState({ queues }));
  }

  create = async () => {
    try {
      this.setState({ creating: true });
      await post("/api/create-queue");
      navigate(`/${this.props.user.username}/settings`);
    } catch (e) {
      console.log(e);
      alert("Something went horribly wrong. Please report this issue to Cychloryn.");
    }
    this.setState({ creating: false });
  };

  filterQueues = (queue) => {
    let ok = true;
    if (this.state.mode) {
      console.log(queue.modes);
      console.log(this.state.mode);
      ok = ok && queue.modes.includes(this.state.mode);
      console.log(ok);
    }

    if (this.state.modderType === "bn") {
      ok = ok && isBN(queue);
    } else if (this.state.modderType) {
      ok = ok && queue.modderType === this.state.modderType;
    }

    return ok;
  };

  sortQueues = (a, b) => {
    if (a.open && !b.open) return -1;
    if (!a.open && b.open) return 1;

    if (isBN(a) && !isBN(b)) return -1;
    if (!isBN(a) && isBN(b)) return 1;

    return 0;
  };

  render() {
    return (
      <Content className="u-flex-justifyCenter">
        <div className="Home-container">
          <div className="Home-create">
            {this.props.user._id ? (
              <Button type="primary" loading={this.state.creating} onClick={this.create}>
                Create a Queue
              </Button>
            ) : (
              <div>Log in to create your own queue</div>
            )}
          </div>

          <div className="Home-filters">
            <span>Filters</span>
            <Radio.Group onChange={(e) => this.setState({ mode: e.target.value })}>
              <Radio.Button value="Standard">Standard</Radio.Button>
              <Radio.Button value="Taiko">Taiko</Radio.Button>
              <Radio.Button value="Catch the Beat">Catch</Radio.Button>
              <Radio.Button value="Mania">Mania</Radio.Button>
            </Radio.Group>
            <Radio.Group onChange={(e) => this.setState({ modderType: e.target.value })}>
              <Radio.Button value="bn">Beatmap Nominators</Radio.Button>
              <Radio.Button value="modder">Modders</Radio.Button>
            </Radio.Group>
          </div>

          <div className="Home-queues">
            <QueueList
              title={"Modding Queues"}
              queues={this.state.queues.filter(this.filterQueues).sort(this.sortQueues)}
            />
          </div>
        </div>
      </Content>
    );
  }
}

export default Home;
